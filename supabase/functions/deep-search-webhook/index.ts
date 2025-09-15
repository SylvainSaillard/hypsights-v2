import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeepSearchWebhookPayload {
  briefId: string
  userEmail: string
  briefTitle: string
  briefDescription: string
  additionalInfo?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse the webhook payload
    const payload: DeepSearchWebhookPayload = await req.json()
    
    console.log('Deep search webhook received:', {
      briefId: payload.briefId,
      userEmail: payload.userEmail,
      briefTitle: payload.briefTitle
    })

    // Validate required fields
    if (!payload.briefId || !payload.userEmail) {
      throw new Error('Missing required fields: briefId and userEmail')
    }

    // Verify the brief exists and get user_id for security
    const { data: briefData, error: briefError } = await supabase
      .from('briefs')
      .select('id, user_id, title')
      .eq('id', payload.briefId)
      .single()

    if (briefError || !briefData) {
      throw new Error(`Brief with ID ${payload.briefId} not found`)
    }

    // Update the brief with deep search requested flag
    const { data, error } = await supabase
      .from('briefs')
      .update({
        deep_search_requested: true,
        deep_search_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.briefId)
      .select('id, title, deep_search_requested, deep_search_requested_at')

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to update brief: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error(`Brief with ID ${payload.briefId} not found`)
    }

    console.log('Brief updated successfully:', data[0])

    // Log the event for analytics
    await supabase
      .from('raw_analytics_events')
      .insert({
        event_name: 'deep_search_requested',
        user_id: briefData.user_id,
        payload: {
          brief_id: payload.briefId,
          brief_title: payload.briefTitle,
          user_email: payload.userEmail,
          additional_info: payload.additionalInfo || null
        },
        source: 'webhook',
        timestamp: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deep search request processed successfully',
        brief: data[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Deep search webhook error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
