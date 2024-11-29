import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

const url = process.env.BACKEND_URL as string;
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

function reloadWebsite() {
  fetch(url)
    .then((response) => {
      console.log(
        `Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`
      );
    })
    .catch((error) => {
      console.error(
        `Error reloading at ${new Date().toISOString()}:`,
        error.message
      );
    });
}

async function reloadDatabase() {
  try {
    const { data, error } = await supabase
      .from('your_table') // Specify your table name
      .select('id')
      .limit(1); // Limit to reduce load
    
    if (error) {
      console.error('Error pinging Supabase:', error);
    } else {
      console.log('Supabase ping successful at', new Date());
    }
  } catch (err) {
    console.error('Failed to ping Supabase:', err);
  }
}

export default function preventDisabledService(){
  // Schedule the cron job to run every 14 minutes
  cron.schedule('*/14 * * * *', () => {
    console.log('Running reloadWebsite cron job');
    reloadWebsite();
  });

  // Schedule a task to ping the database every Monday and Thursday at 9:00 AM
  cron.schedule('0 9 * * 1,4', async () => {
    console.log('Scheduled ping to Supabase every Monday and Thursday at 9:00 AM.');
    await reloadDatabase();
  });
}
