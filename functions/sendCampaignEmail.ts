import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaign_id, contact_ids, test_mode = false } = await req.json();

    if (!campaign_id) {
      return Response.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    // Get campaign details
    const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({ id: campaign_id });
    const campaign = campaigns[0];
    
    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get template
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ id: campaign.template_id });
    const template = templates[0];
    
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get active SMTP config
    const smtpConfigs = await base44.asServiceRole.entities.SMTPConfig.filter({ is_active: true });
    const smtpConfig = smtpConfigs[0];
    
    if (!smtpConfig) {
      return Response.json({ error: 'No active SMTP configuration' }, { status: 400 });
    }

    // Get contacts to send to
    let contacts = [];
    if (contact_ids && contact_ids.length > 0) {
      // Send to specific contacts
      for (const id of contact_ids) {
        const contactList = await base44.asServiceRole.entities.Contact.filter({ id });
        if (contactList[0]) contacts.push(contactList[0]);
      }
    } else {
      // Apply segment criteria
      const criteria = campaign.segment_criteria || {};
      contacts = await base44.asServiceRole.entities.Contact.filter(criteria);
    }

    // Filter out unsubscribed/bounced
    contacts = contacts.filter(c => c.status === 'subscribed');

    if (contacts.length === 0) {
      return Response.json({ error: 'No valid contacts to send to' }, { status: 400 });
    }

    // Check daily limit
    if (smtpConfig.emails_sent_today + contacts.length > smtpConfig.daily_limit) {
      return Response.json({ 
        error: `Daily limit would be exceeded. Limit: ${smtpConfig.daily_limit}, Sent today: ${smtpConfig.emails_sent_today}`,
      }, { status: 400 });
    }

    const results = {
      sent: 0,
      failed: 0,
      total: contacts.length,
    };

    // In a real implementation, this would send actual emails via SMTP
    // For now, we'll simulate the sending and track metrics
    for (const contact of contacts) {
      try {
        // Replace variables in subject and body
        let subject = template.subject;
        let body = template.body;
        
        const variables = {
          '{{first_name}}': contact.first_name || '',
          '{{last_name}}': contact.last_name || '',
          '{{email}}': contact.email || '',
          '{{company}}': contact.company || '',
        };

        Object.entries(variables).forEach(([key, value]) => {
          subject = subject.replace(new RegExp(key, 'g'), value);
          body = body.replace(new RegExp(key, 'g'), value);
        });

        // Create metric record
        await base44.asServiceRole.entities.EmailCampaignMetric.create({
          campaign_id: campaign.id,
          recipient_email: contact.email,
          lead_id: contact.id,
          sent_at: new Date().toISOString(),
          bounced: false,
        });

        results.sent++;

        // Update contact last engaged
        await base44.asServiceRole.entities.Contact.update(contact.id, {
          last_engaged: new Date().toISOString(),
        });

      } catch (error) {
        console.error(`Failed to send to ${contact.email}:`, error);
        results.failed++;
      }
    }

    // Update campaign stats
    await base44.asServiceRole.entities.EmailCampaign.update(campaign.id, {
      sent_count: (campaign.sent_count || 0) + results.sent,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    // Update SMTP config sent count
    await base44.asServiceRole.entities.SMTPConfig.update(smtpConfig.id, {
      emails_sent_today: smtpConfig.emails_sent_today + results.sent,
    });

    return Response.json({
      success: true,
      results,
      message: `Sent ${results.sent} emails successfully, ${results.failed} failed`,
    });

  } catch (error) {
    console.error('Send campaign error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});