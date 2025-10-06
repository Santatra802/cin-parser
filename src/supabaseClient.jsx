import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivystcdcecuiuwdtjwnn.supabase.co' //'https://db.ivystcdcecuiuwdtjwnn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eXN0Y2RjZWN1aXV3ZHRqd25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTE2OTQsImV4cCI6MjA3NDI4NzY5NH0.XB_Ko25QSnfDsocOKCQh8Eg2Koa3QcmNyWxPsG2TxF4'; // ← Ton clé publique (non secrète)

export const supabase = createClient(supabaseUrl, supabaseKey);
