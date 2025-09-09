import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { Petition, Signature, EmailLog, PetitionStats } from '../types';

const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export class DatabaseService {
  // Petitions
  async getPetitionBySlug(slug: string): Promise<Petition | null> {
    const { data, error } = await supabase
      .from('petitions')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return data;
  }

  // Signatures
  async createSignature(signature: Omit<Signature, 'id' | 'created_at'>): Promise<Signature> {
    const { data, error } = await supabase
      .from('signatures')
      .insert(signature)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSignatureByEmailAndPetition(email: string, petitionId: string): Promise<Signature | null> {
    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('email', email)
      .eq('petition_id', petitionId)
      .eq('status', 'pending')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async confirmSignature(token: string): Promise<Signature | null> {
    const { data, error } = await supabase
      .from('signatures')
      .update({ 
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('confirm_token', token)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async getSignaturesByPetition(petitionSlug: string): Promise<Signature[]> {
    const { data, error } = await supabase
      .from('signatures')
      .select(`
        *,
        petitions!inner(slug)
      `)
      .eq('petitions.slug', petitionSlug)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Stats
  async getPetitionStats(slug: string): Promise<PetitionStats | null> {
    const { data, error } = await supabase
      .from('petition_stats')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Email Log
  async logEmail(emailLog: Omit<EmailLog, 'id' | 'sent_at'>): Promise<EmailLog> {
    const { data, error } = await supabase
      .from('email_log')
      .insert(emailLog)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Rate limiting
  async getRecentSignaturesByEmail(email: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs).toISOString();
    
    const { count, error } = await supabase
      .from('signatures')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .eq('status', 'pending')
      .gte('created_at', since);

    if (error) throw error;
    return count || 0;
  }
}

export const db = new DatabaseService();
