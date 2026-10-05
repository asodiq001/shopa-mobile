import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Same Supabase project credentials as the Shopa Web app
const supabaseUrl = "https://lzdcbveegvixsratqpbh.supabase.co";
const supabaseAnonKey = "sb_publishable_f1_yN6mds8JnnyxVQNJtkg_D7_Q7xFO";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

