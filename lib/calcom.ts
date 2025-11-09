/**
 * Cal.com API Integration
 * Handles meeting creation and management through Cal.com
 */

interface CalComBooking {
  id: number;
  uid: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    name: string;
  }>;
  meetingUrl?: string;
}

interface CreateBookingParams {
  eventTypeId: number;
  start: string; // ISO 8601 format
  responses: {
    name: string;
    email: string;
    notes?: string;
  };
  timeZone: string;
  language: string;
  metadata?: Record<string, any>;
}

/**
 * Create a Cal.com booking
 */
export async function createCalComBooking(params: CreateBookingParams): Promise<CalComBooking | null> {
  const apiKey = process.env.CAL_COM_API_KEY;

  if (!apiKey) {
    console.error('❌ CAL_COM_API_KEY is not configured');
    return null;
  }

  try {
    console.log('📅 Creating Cal.com booking...', params);

    const response = await fetch('https://api.cal.com/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cal.com API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ Cal.com booking created:', data);
    
    return data;
  } catch (error) {
    console.error('Error creating Cal.com booking:', error);
    return null;
  }
}

/**
 * Cancel a Cal.com booking
 */
export async function cancelCalComBooking(bookingUid: string, reason?: string): Promise<boolean> {
  const apiKey = process.env.CAL_COM_API_KEY;

  if (!apiKey) {
    console.error('❌ CAL_COM_API_KEY is not configured');
    return false;
  }

  try {
    console.log('🗑️ Cancelling Cal.com booking:', bookingUid);

    const response = await fetch(`https://api.cal.com/v1/bookings/${bookingUid}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        reason: reason || 'Booking cancelled',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cal.com cancel error:', response.status, errorData);
      return false;
    }

    console.log('✅ Cal.com booking cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling Cal.com booking:', error);
    return false;
  }
}

/**
 * Get Cal.com booking details
 */
export async function getCalComBooking(bookingUid: string): Promise<CalComBooking | null> {
  const apiKey = process.env.CAL_COM_API_KEY;

  if (!apiKey) {
    console.error('❌ CAL_COM_API_KEY is not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.cal.com/v1/bookings/${bookingUid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Cal.com booking:', error);
    return null;
  }
}
