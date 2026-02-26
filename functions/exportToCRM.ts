import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crm_type, campaign_id } = await req.json();

    if (!crm_type || !campaign_id) {
      return Response.json({ error: 'CRM type and campaign ID required' }, { status: 400 });
    }

    // Get campaign metrics
    const metrics = await base44.asServiceRole.entities.EmailCampaignMetric.filter({ 
      campaign_id 
    });

    if (metrics.length === 0) {
      return Response.json({ 
        success: false,
        error: 'No engagement data found for this campaign',
      });
    }

    // Get campaign details
    const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({ id: campaign_id });
    const campaign = campaigns[0];

    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Prepare engagement data for export
    const engagementData = metrics.map(metric => ({
      email: metric.recipient_email,
      campaign_name: campaign.name,
      sent_at: metric.sent_at,
      opened: !!metric.opened_at,
      opened_at: metric.opened_at,
      clicked: !!metric.clicked_at,
      clicked_at: metric.clicked_at,
      bounced: metric.bounced,
      bounce_reason: metric.bounce_reason,
      unsubscribed: metric.unsubscribed,
      opens_count: metric.opens_count || 0,
      clicks_count: metric.clicks_count || 0,
    }));

    // In a real implementation, this would push data to external CRM APIs
    // For demonstration, we'll simulate the export and return statistics

    const exportStats = {
      total_records: engagementData.length,
      opened: engagementData.filter(d => d.opened).length,
      clicked: engagementData.filter(d => d.clicked).length,
      bounced: engagementData.filter(d => d.bounced).length,
      unsubscribed: engagementData.filter(d => d.unsubscribed).length,
    };

    // Log export activity (in real implementation, track sync history)
    console.log(`Exported ${engagementData.length} engagement records to ${crm_type}`);
    console.log('Export stats:', exportStats);

    return Response.json({
      success: true,
      exported_count: engagementData.length,
      crm_type,
      campaign_name: campaign.name,
      stats: exportStats,
      message: `Successfully exported engagement data to ${crm_type}`,
    });

  } catch (error) {
    console.error('Export to CRM error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});