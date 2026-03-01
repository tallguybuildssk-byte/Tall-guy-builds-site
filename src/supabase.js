import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ptczgktyxifzbaxcsqan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Y3pna3R5eGlmemJheGNzcWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjY3OTUsImV4cCI6MjA4NzIwMjc5NX0.5JBo2FiwWub-qhEWBT3al6PaEJVXrxGscNOUN1ubooQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
