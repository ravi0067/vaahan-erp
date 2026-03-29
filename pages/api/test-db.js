import { supabase, testConnection } from '../../lib/supabase'

/**
 * API endpoint to test Supabase database connection
 * GET /api/test-db
 * 
 * Returns:
 * - success: boolean
 * - message: string
 * - timestamp: ISO string
 * - error: string (if any)
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET request.' 
    })
  }

  try {
    console.log('Testing VAHAN ERP database connection...')
    
    // Test basic connection
    const connectionTest = await testConnection()
    
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        error: connectionTest.error,
        timestamp: new Date().toISOString(),
        system: 'VAHAN ERP'
      })
    }

    // Additional test - try to get database info
    const { data: dbInfo, error: dbError } = await supabase
      .rpc('version')
      .single()
    
    const response = {
      success: true,
      message: 'VAHAN ERP - Supabase connection successful!',
      timestamp: new Date().toISOString(),
      system: 'VAHAN ERP',
      database: {
        connected: true,
        version: dbInfo || 'Available'
      }
    }

    console.log('Database connection test passed:', response)
    res.status(200).json(response)

  } catch (error) {
    console.error('Database connection test failed:', error)
    
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown database error',
      timestamp: new Date().toISOString(),
      system: 'VAHAN ERP'
    })
  }
}