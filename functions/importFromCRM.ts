import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crm_type } = await req.json();

    if (!crm_type) {
      return Response.json({ error: 'CRM type required' }, { status: 400 });
    }

    // In a real implementation, this would connect to external CRM APIs
    // For now, we'll simulate importing contacts
    
    const mockContacts = {
      salesforce: [
        { email: 'john.smith@acme.com', first_name: 'John', last_name: 'Smith', company: 'Acme Corp', source: 'Salesforce Import', custom_fields: { industry: 'Technology', annual_revenue: 5000000 } },
        { email: 'sarah.jones@techco.com', first_name: 'Sarah', last_name: 'Jones', company: 'TechCo', source: 'Salesforce Import', custom_fields: { industry: 'Software', annual_revenue: 2000000 } },
        { email: 'mike.williams@bizinc.com', first_name: 'Mike', last_name: 'Williams', company: 'Biz Inc', source: 'Salesforce Import', custom_fields: { industry: 'Consulting', annual_revenue: 1500000 } },
      ],
      hubspot: [
        { email: 'emily.brown@startup.io', first_name: 'Emily', last_name: 'Brown', company: 'Startup.io', source: 'HubSpot Import', custom_fields: { lifecycle_stage: 'lead', lead_score: 75 } },
        { email: 'david.miller@enterprise.com', first_name: 'David', last_name: 'Miller', company: 'Enterprise Ltd', source: 'HubSpot Import', custom_fields: { lifecycle_stage: 'opportunity', lead_score: 90 } },
      ],
      pipedrive: [
        { email: 'lisa.anderson@sales.co', first_name: 'Lisa', last_name: 'Anderson', company: 'Sales Co', source: 'Pipedrive Import', custom_fields: { deal_stage: 'qualified', deal_value: 50000 } },
      ],
      zoho: [
        { email: 'tom.jackson@business.net', first_name: 'Tom', last_name: 'Jackson', company: 'Business Network', source: 'Zoho Import', custom_fields: { rating: 'Hot', priority: 'High' } },
      ],
    };

    const contactsToImport = mockContacts[crm_type] || [];
    
    if (contactsToImport.length === 0) {
      return Response.json({ 
        success: false,
        error: 'No contacts found in CRM',
      });
    }

    // Import contacts with upsert logic (update if exists, create if not)
    let imported = 0;
    let updated = 0;

    for (const contactData of contactsToImport) {
      try {
        // Check if contact exists
        const existing = await base44.asServiceRole.entities.Contact.filter({ 
          email: contactData.email 
        });

        if (existing.length > 0) {
          // Update existing
          await base44.asServiceRole.entities.Contact.update(existing[0].id, {
            ...contactData,
            status: 'subscribed',
          });
          updated++;
        } else {
          // Create new
          await base44.asServiceRole.entities.Contact.create({
            ...contactData,
            status: 'subscribed',
            subscribed_at: new Date().toISOString(),
          });
          imported++;
        }
      } catch (error) {
        console.error(`Failed to import contact ${contactData.email}:`, error);
      }
    }

    return Response.json({
      success: true,
      imported_count: imported,
      updated_count: updated,
      total_processed: imported + updated,
      crm_type,
    });

  } catch (error) {
    console.error('Import from CRM error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});