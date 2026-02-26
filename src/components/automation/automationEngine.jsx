/**
 * Automation Engine
 * Handles trigger normalization, node validation, ordered chain execution,
 * and structured result/error output.
 */

// ─── Trigger Normalization ─────────────────────────────────────────────────
export function normalizeTriggerPayload(trigger, rawPayload = {}) {
  const base = {
    trigger_type: trigger?.type || 'unknown',
    triggered_at: new Date().toISOString(),
    contact: {
      id: rawPayload.contact_id || rawPayload.id || '',
      email: rawPayload.email || rawPayload.contact_email || '',
      first_name: rawPayload.first_name || rawPayload.name?.split(' ')[0] || '',
      last_name: rawPayload.last_name || rawPayload.name?.split(' ')[1] || '',
      company: rawPayload.company || '',
      tags: rawPayload.tags || [],
      status: rawPayload.status || '',
      contact_type: rawPayload.contact_type || '',
    },
    opportunity: {
      id: rawPayload.opportunity_id || '',
      stage: rawPayload.opportunity_stage || '',
      value: rawPayload.opportunity_value || 0,
      status: rawPayload.opportunity_status || '',
      pipeline: rawPayload.opportunity_pipeline || '',
    },
    meta: rawPayload.meta || {},
  };

  // Trigger-specific normalization
  switch (trigger?.type) {
    case 'tag_added':
    case 'tag_removed':
      base.meta.tag = rawPayload.tag || trigger?.condition?.tag || '';
      break;
    case 'email_opened':
    case 'email_clicked':
    case 'trigger_link_clicked':
      base.meta.campaign_id = rawPayload.campaign_id || '';
      base.meta.link_url = rawPayload.link_url || '';
      break;
    case 'no_response':
      base.meta.days_since_last_contact = rawPayload.days || 0;
      break;
    case 'opportunity_stage_changed':
      base.meta.previous_stage = rawPayload.previous_stage || '';
      base.meta.new_stage = rawPayload.new_stage || base.opportunity.stage;
      break;
    case 'form_submission':
    case 'survey_submitted':
    case 'order_form_submission':
      base.meta.form_id = rawPayload.form_id || '';
      base.meta.form_data = rawPayload.form_data || {};
      break;
    case 'appointment_status':
    case 'customer_booked':
      base.meta.appointment_status = rawPayload.appointment_status || '';
      base.meta.appointment_date = rawPayload.appointment_date || '';
      break;
    case 'membership_signup':
    case 'category_completed':
    case 'offer_access_granted':
    case 'offer_access_removed':
      base.meta.product_name = rawPayload.product_name || '';
      break;
    case 'document_event':
      base.meta.document_status = rawPayload.document_status || '';
      break;
    case 'inbound_webhook':
      base.meta.webhook_data = rawPayload.webhook_data || {};
      break;
    case 'birthday_reminder':
    case 'custom_date_reminder':
      base.meta.reminder_date = rawPayload.reminder_date || '';
      break;
    case 'task_added':
    case 'task_completed':
      base.meta.task_title = rawPayload.task_title || '';
      break;
    case 'note_added':
      base.meta.note_content = rawPayload.note_content || '';
      break;
    case 'call_event':
    case 'customer_replied':
      base.meta.channel = rawPayload.channel || '';
      break;
    default:
      break;
  }
  return base;
}

// ─── Node Validators ───────────────────────────────────────────────────────
export function validateNode(node) {
  const errors = [];
  const cfg = node.config || {};

  switch (node.type) {
    case 'send_email':
      if (!cfg.template_id && !cfg.subject) errors.push('Subject is required for custom emails');
      if (!cfg.template_id && !cfg.body) errors.push('Body is required for custom emails');
      break;
    case 'wait':
      if (!cfg.wait_days || cfg.wait_days < 1) errors.push('Wait duration must be at least 1');
      if (!cfg.wait_unit) errors.push('Wait unit is required');
      break;
    case 'condition':
      if (!cfg.condition_type) errors.push('Condition type is required');
      if (cfg.condition_type === 'has_tag' && !cfg.tag) errors.push('Tag is required');
      if (cfg.condition_type === 'opp_value_gt' && !cfg.opp_value) errors.push('Value is required');
      if (cfg.condition_type === 'contact_status' && !cfg.contact_status) errors.push('Status is required');
      break;
    case 'add_tag':
    case 'remove_tag':
      if (!cfg.tag) errors.push('Tag name is required');
      break;
    case 'assign_salesperson':
      if (!cfg.salesperson) errors.push('Salesperson is required');
      break;
    case 'move_to_campaign':
      if (!cfg.campaign_id) errors.push('Campaign is required');
      break;
    case 'change_status':
      if (!cfg.new_status) errors.push('New status is required');
      break;
    case 'create_opportunity':
      if (!cfg.stage) errors.push('Stage is required');
      break;
    case 'send_sms':
      if (!cfg.body) errors.push('SMS message is required');
      break;
    case 'send_voicemail':
      if (!cfg.script) errors.push('Voicemail script is required');
      break;
    case 'send_dm':
      if (!cfg.body) errors.push('Message is required');
      break;
    case 'add_task':
      if (!cfg.title) errors.push('Task title is required');
      break;
    case 'send_notification':
      if (!cfg.message) errors.push('Notification message is required');
      break;
    case 'custom_webhook':
      if (!cfg.url) errors.push('Webhook URL is required');
      break;
    case 'stripe_charge':
      if (!cfg.amount || Number(cfg.amount) <= 0) errors.push('Valid charge amount is required');
      break;
    case 'google_sheets':
      if (!cfg.sheet_id) errors.push('Sheet URL or ID is required');
      break;
    default:
      break;
  }
  return errors;
}

export function validateWorkflow(trigger, nodes) {
  const issues = [];
  if (!trigger?.type) issues.push({ nodeId: 'trigger', message: 'Trigger is not set' });
  if (!nodes || nodes.length === 0) issues.push({ nodeId: null, message: 'Add at least one action node' });

  nodes?.forEach((node, i) => {
    const errs = validateNode(node);
    errs.forEach(msg => issues.push({ nodeId: node.id, message: `Node ${i + 1} (${node.type}): ${msg}` }));
  });
  return issues;
}

// ─── Node Execution Simulators ────────────────────────────────────────────
function evaluateCondition(node, payload) {
  const cfg = node.config || {};
  const contact = payload.contact || {};
  const opp = payload.opportunity || {};

  switch (cfg.condition_type) {
    case 'has_tag':
      return (contact.tags || []).includes(cfg.tag);
    case 'email_opened':
      return !!payload.meta?.email_opened;
    case 'link_clicked':
      return !!payload.meta?.link_clicked;
    case 'no_response':
      return (payload.meta?.days_since_last_contact || 0) >= (cfg.no_response_days || 3);
    case 'opp_value_gt':
      return (opp.value || 0) > Number(cfg.opp_value || 0);
    case 'contact_status':
      return contact.status === cfg.contact_status;
    default:
      return true;
  }
}

function applyNodeToPayload(node, payload) {
  const cfg = node.config || {};
  const updated = JSON.parse(JSON.stringify(payload)); // deep clone

  switch (node.type) {
    case 'add_tag':
      if (cfg.tag && !updated.contact.tags.includes(cfg.tag)) {
        updated.contact.tags = [...updated.contact.tags, cfg.tag];
      }
      break;
    case 'remove_tag':
      updated.contact.tags = updated.contact.tags.filter(t => t !== cfg.tag);
      break;
    case 'change_status':
      updated.contact.status = cfg.new_status;
      break;
    case 'update_contact':
      if (cfg.field && cfg.field_value !== undefined) {
        updated.contact[cfg.field] = cfg.field_value;
      }
      break;
    case 'assign_salesperson':
      updated.contact.assigned_salesperson = cfg.salesperson;
      break;
    case 'create_opportunity':
      updated.opportunity = {
        ...updated.opportunity,
        stage: cfg.stage,
        value: cfg.value || 0,
        pipeline: cfg.pipeline || '',
        status: 'active',
      };
      break;
    case 'update_opportunity':
      if (cfg.stage) updated.opportunity.stage = cfg.stage;
      if (cfg.status) updated.opportunity.status = cfg.status;
      break;
    case 'move_to_campaign':
      updated.contact.campaign_id = cfg.campaign_id;
      break;
    case 'add_note':
      updated.meta.last_note = cfg.note;
      break;
    case 'add_task':
      updated.meta.last_task = cfg.title;
      break;
    case 'send_notification':
      updated.meta.last_notification_to = cfg.notify_user;
      break;
    case 'add_to_workflow':
      updated.meta.added_to_workflow = cfg.workflow_name;
      break;
    case 'remove_from_workflow':
      updated.meta.removed_from_workflow = cfg.scope;
      break;
    case 'send_sms':
    case 'send_voicemail':
    case 'send_dm':
    case 'send_review_request':
    case 'custom_webhook':
    case 'stripe_charge':
    case 'google_sheets':
      // External/async actions — no local payload mutation, logged as dispatched
      break;
    default:
      break;
  }
  return updated;
}

// ─── Main Engine: Run Workflow ─────────────────────────────────────────────
export function runWorkflow(trigger, nodes, rawPayload = {}) {
  const result = {
    success: false,
    trigger_type: trigger?.type,
    started_at: new Date().toISOString(),
    completed_at: null,
    steps: [],
    final_payload: null,
    error: null,
  };

  // Step 1: Validate
  const validationIssues = validateWorkflow(trigger, nodes);
  if (validationIssues.length > 0) {
    result.error = { failing_node_id: validationIssues[0].nodeId, message: validationIssues[0].message, issues: validationIssues };
    return result;
  }

  // Step 2: Normalize payload
  let payload = normalizeTriggerPayload(trigger, rawPayload);

  // Step 3: Execute nodes in order
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const stepResult = {
      node_id: node.id,
      node_type: node.type,
      index: i + 1,
      status: 'pending',
      output: null,
      error: null,
      branch_taken: null,
    };

    // Validate this node before executing
    const nodeErrors = validateNode(node);
    if (nodeErrors.length > 0) {
      stepResult.status = 'error';
      stepResult.error = nodeErrors.join('; ');
      result.steps.push(stepResult);
      result.error = { failing_node_id: node.id, message: stepResult.error };
      return result;
    }

    try {
      if (node.type === 'wait') {
        stepResult.status = 'success';
        stepResult.output = `Waiting ${node.config?.wait_days} ${node.config?.wait_unit || 'days'}`;
        if (node.config?.send_at_time) stepResult.output += ` (send at ${node.config.send_at_time})`;

      } else if (node.type === 'send_email') {
        const subject = node.config?.subject || '[Template Email]';
        const body = node.config?.body || '';
        const interpolate = str => str
          .replace(/\{\{first_name\}\}/g, payload.contact.first_name || 'there')
          .replace(/\{\{company\}\}/g, payload.contact.company || '')
          .replace(/\{\{lead_email\}\}/g, payload.contact.email || '')
          .replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString());

        stepResult.status = 'success';
        stepResult.output = {
          to: payload.contact.email,
          subject: interpolate(subject),
          body_preview: interpolate(body).slice(0, 120),
        };
      } else if (node.type === 'send_sms') {
        const body = node.config?.body || '';
        const interpolate = str => str.replace(/\{\{first_name\}\}/g, payload.contact.first_name || 'there').replace(/\{\{company\}\}/g, payload.contact.company || '');
        stepResult.status = 'success';
        stepResult.output = { to: payload.contact.email, message: interpolate(body).slice(0, 160) };
      } else if (['send_voicemail','send_dm','send_review_request','send_notification'].includes(node.type)) {
        stepResult.status = 'success';
        stepResult.output = `${node.type.replace(/_/g,' ')} dispatched to ${payload.contact.email}`;
      } else if (node.type === 'custom_webhook') {
        stepResult.status = 'success';
        stepResult.output = `Webhook dispatched → ${node.config?.url}`;
      } else if (node.type === 'stripe_charge') {
        stepResult.status = 'success';
        stepResult.output = `Stripe charge of $${node.config?.amount} queued for ${payload.contact.email}`;
      } else if (node.type === 'google_sheets') {
        stepResult.status = 'success';
        stepResult.output = `Google Sheets: ${node.config?.sheets_action || 'add_row'} on sheet ${node.config?.sheet_id}`;
      } else if (['add_to_workflow','remove_from_workflow'].includes(node.type)) {
        payload = applyNodeToPayload(node, payload);
        stepResult.status = 'success';
        stepResult.output = `${node.type.replace(/_/g,' ')}: ${node.config?.workflow_name || node.config?.scope || ''}`;
      } else if (node.type === 'add_task') {
        payload = applyNodeToPayload(node, payload);
        stepResult.status = 'success';
        stepResult.output = `Task created: "${node.config?.title}"`;
      } else if (node.type === 'add_note') {
        payload = applyNodeToPayload(node, payload);
        stepResult.status = 'success';
        stepResult.output = `Note added: "${(node.config?.note || '').slice(0, 80)}"`;


      } else if (node.type === 'condition') {
        const passed = evaluateCondition(node, payload);
        stepResult.status = 'success';
        stepResult.branch_taken = passed ? 'YES' : 'NO';
        stepResult.output = `Condition "${node.config.condition_type}" evaluated to: ${passed ? 'YES' : 'NO'}`;

      } else {
        // All contact/opportunity mutation nodes
        payload = applyNodeToPayload(node, payload);
        stepResult.status = 'success';
        stepResult.output = `Applied: ${node.type.replace(/_/g, ' ')}`;
      }
    } catch (err) {
      stepResult.status = 'error';
      stepResult.error = err.message || 'Unknown error';
      result.steps.push(stepResult);
      result.error = { failing_node_id: node.id, message: stepResult.error };
      return result;
    }

    result.steps.push(stepResult);
  }

  result.success = true;
  result.final_payload = payload;
  result.completed_at = new Date().toISOString();
  return result;
}