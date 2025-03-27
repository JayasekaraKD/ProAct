// src/services/storageService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const storageService = {
    async uploadFile(
        file: File,
        path: string
    ): Promise<{ path: string; size: number }> {
        try {
            const { data, error } = await supabase.storage
                .from('documents')
                .upload(path, file);

            if (error) throw error;

            return {
                path: data.path,
                size: file.size
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    async deleteFile(path: string): Promise<void> {
        try {
            const { error } = await supabase.storage
                .from('documents')
                .remove([path]);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    async getFileUrl(path: string): Promise<string> {
        try {
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(path, 3600);

            if (error || !data?.signedUrl) {
                throw new Error('Could not generate download URL');
            }

            return data.signedUrl;
        } catch (error) {
            console.error('Error getting file URL:', error);
            throw error;
        }
    }
};