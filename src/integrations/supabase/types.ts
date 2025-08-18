export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounting_transactions: {
        Row: {
          account_category: string
          account_type: string
          amount: number
          contract_id: string | null
          created_at: string | null
          created_by: string
          credit_account: string
          customer_id: string | null
          debit_account: string
          description: string
          id: string
          owner_id: string | null
          posted_at: string | null
          reference_id: string
          reference_number: string
          status: string
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          account_category: string
          account_type: string
          amount: number
          contract_id?: string | null
          created_at?: string | null
          created_by: string
          credit_account: string
          customer_id?: string | null
          debit_account: string
          description: string
          id?: string
          owner_id?: string | null
          posted_at?: string | null
          reference_id: string
          reference_number: string
          status?: string
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          account_category?: string
          account_type?: string
          amount?: number
          contract_id?: string | null
          created_at?: string | null
          created_by?: string
          credit_account?: string
          customer_id?: string | null
          debit_account?: string
          description?: string
          id?: string
          owner_id?: string | null
          posted_at?: string | null
          reference_id?: string
          reference_number?: string
          status?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounting_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_credit_account_fkey"
            columns: ["credit_account"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_debit_account_fkey"
            columns: ["debit_account"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vehicle_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      behavioral_analytics: {
        Row: {
          analysis_period_end: string
          analysis_period_start: string
          analysis_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          insights: Json | null
          opportunity_score: number | null
          pattern_data: Json
          recommendations: Json | null
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          analysis_period_end: string
          analysis_period_start: string
          analysis_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          insights?: Json | null
          opportunity_score?: number | null
          pattern_data?: Json
          recommendations?: Json | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          analysis_period_end?: string
          analysis_period_start?: string
          analysis_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          insights?: Json | null
          opportunity_score?: number | null
          pattern_data?: Json
          recommendations?: Json | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          id: string
          is_active: boolean
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_accruals: {
        Row: {
          accrued_amount: number
          calculated_by: string | null
          calculation_date: string
          contract_id: string
          created_at: string
          daily_rate: number
          days_elapsed: number
          id: string
          outstanding_amount: number
          receipts_amount: number
          updated_at: string
        }
        Insert: {
          accrued_amount?: number
          calculated_by?: string | null
          calculation_date: string
          contract_id: string
          created_at?: string
          daily_rate?: number
          days_elapsed?: number
          id?: string
          outstanding_amount?: number
          receipts_amount?: number
          updated_at?: string
        }
        Update: {
          accrued_amount?: number
          calculated_by?: string | null
          calculation_date?: string
          contract_id?: string
          created_at?: string
          daily_rate?: number
          days_elapsed?: number
          id?: string
          outstanding_amount?: number
          receipts_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      cost_center_mappings: {
        Row: {
          cost_center_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          updated_at: string
        }
        Insert: {
          cost_center_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string
        }
        Update: {
          cost_center_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_center_mappings_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          center_code: string
          center_name: string
          center_type: string
          created_at: string
          entity_id: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          center_code: string
          center_name: string
          center_type: string
          created_at?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          center_code?: string
          center_name?: string
          center_type?: string
          created_at?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      customer_documents: {
        Row: {
          created_at: string | null
          customer_id: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_guarantors: {
        Row: {
          account_number: string | null
          address: string | null
          bank_name: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          customer_id: string
          date_of_birth: string | null
          district: string | null
          email: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          license_expiry: string | null
          license_number: string | null
          monthly_income: number | null
          name: string
          name_english: string | null
          national_id: string
          nationality: string | null
          notes: string | null
          phone: string
          phone_secondary: string | null
          postal_code: string | null
          relation: string
          updated_at: string | null
          work_phone: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          customer_id: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          license_expiry?: string | null
          license_number?: string | null
          monthly_income?: number | null
          name: string
          name_english?: string | null
          national_id: string
          nationality?: string | null
          notes?: string | null
          phone: string
          phone_secondary?: string | null
          postal_code?: string | null
          relation: string
          updated_at?: string | null
          work_phone?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          bank_name?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          license_expiry?: string | null
          license_number?: string | null
          monthly_income?: number | null
          name?: string
          name_english?: string | null
          national_id?: string
          nationality?: string | null
          notes?: string | null
          phone?: string
          phone_secondary?: string | null
          postal_code?: string | null
          relation?: string
          updated_at?: string | null
          work_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_guarantors_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_ratings: {
        Row: {
          contract_id: string | null
          created_at: string | null
          customer_id: string
          id: string
          rating: number
          rating_date: string | null
          review: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          rating: number
          rating_date?: string | null
          review?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          rating?: number
          rating_date?: string | null
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_ratings_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          address_type: string | null
          bank_account_number: string | null
          bank_name: string | null
          blacklist_date: string | null
          blacklist_reason: string | null
          blacklisted: boolean | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          customer_source: string | null
          date_of_birth: string | null
          district: string | null
          email: string | null
          email_notifications: boolean | null
          email_secondary: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          gender: string | null
          has_insurance: boolean | null
          id: string
          insurance_company: string | null
          insurance_expiry: string | null
          insurance_policy_number: string | null
          international_license: boolean | null
          international_license_expiry: string | null
          international_license_number: string | null
          is_active: boolean | null
          job_title: string | null
          last_rental_date: string | null
          license_expiry: string
          license_issue_date: string | null
          license_issue_place: string | null
          license_number: string
          license_type: string | null
          marital_status: string | null
          marketing_consent: boolean | null
          monthly_income: number | null
          name: string
          name_english: string | null
          national_id: string
          nationality: string | null
          notes: string | null
          payment_terms: string | null
          phone: string
          phone_secondary: string | null
          postal_code: string | null
          preferred_language: string | null
          preferred_payment_method: string | null
          rating: number | null
          referred_by: string | null
          sms_notifications: boolean | null
          total_rentals: number | null
          updated_at: string | null
          work_address: string | null
          work_phone: string | null
        }
        Insert: {
          address?: string | null
          address_type?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          blacklist_date?: string | null
          blacklist_reason?: string | null
          blacklisted?: boolean | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          customer_source?: string | null
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          email_notifications?: boolean | null
          email_secondary?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          gender?: string | null
          has_insurance?: boolean | null
          id?: string
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          international_license?: boolean | null
          international_license_expiry?: string | null
          international_license_number?: string | null
          is_active?: boolean | null
          job_title?: string | null
          last_rental_date?: string | null
          license_expiry: string
          license_issue_date?: string | null
          license_issue_place?: string | null
          license_number: string
          license_type?: string | null
          marital_status?: string | null
          marketing_consent?: boolean | null
          monthly_income?: number | null
          name: string
          name_english?: string | null
          national_id: string
          nationality?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone: string
          phone_secondary?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          preferred_payment_method?: string | null
          rating?: number | null
          referred_by?: string | null
          sms_notifications?: boolean | null
          total_rentals?: number | null
          updated_at?: string | null
          work_address?: string | null
          work_phone?: string | null
        }
        Update: {
          address?: string | null
          address_type?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          blacklist_date?: string | null
          blacklist_reason?: string | null
          blacklisted?: boolean | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          customer_source?: string | null
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          email_notifications?: boolean | null
          email_secondary?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          gender?: string | null
          has_insurance?: boolean | null
          id?: string
          insurance_company?: string | null
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          international_license?: boolean | null
          international_license_expiry?: string | null
          international_license_number?: string | null
          is_active?: boolean | null
          job_title?: string | null
          last_rental_date?: string | null
          license_expiry?: string
          license_issue_date?: string | null
          license_issue_place?: string | null
          license_number?: string
          license_type?: string | null
          marital_status?: string | null
          marketing_consent?: boolean | null
          monthly_income?: number | null
          name?: string
          name_english?: string | null
          national_id?: string
          nationality?: string | null
          notes?: string | null
          payment_terms?: string | null
          phone?: string
          phone_secondary?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          preferred_payment_method?: string | null
          rating?: number | null
          referred_by?: string | null
          sms_notifications?: boolean | null
          total_rentals?: number | null
          updated_at?: string | null
          work_address?: string | null
          work_phone?: string | null
        }
        Relationships: []
      }
      deposit_transactions: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          notes: string | null
          reason: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      digital_signatures: {
        Row: {
          document_id: string
          document_type: string
          id: string
          ip_address: unknown | null
          signature_data: string | null
          signature_hash: string | null
          signed_at: string
          signer_name: string
          signer_role: string
          user_agent: string | null
        }
        Insert: {
          document_id: string
          document_type: string
          id?: string
          ip_address?: unknown | null
          signature_data?: string | null
          signature_hash?: string | null
          signed_at?: string
          signer_name: string
          signer_role: string
          user_agent?: string | null
        }
        Update: {
          document_id?: string
          document_type?: string
          id?: string
          ip_address?: unknown | null
          signature_data?: string | null
          signature_hash?: string | null
          signed_at?: string
          signer_name?: string
          signer_role?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      discount_vouchers: {
        Row: {
          applied_at: string | null
          approval_date: string
          approved_by: string
          contract_id: string
          created_at: string | null
          customer_id: string
          customer_name: string
          discount_amount: number
          discount_percentage: number | null
          discount_reason: string
          discount_type: string
          final_amount: number
          id: string
          issued_at: string | null
          issued_by: string
          notes: string | null
          original_amount: number
          requires_higher_approval: boolean | null
          status: string
          updated_at: string | null
          voucher_number: string
        }
        Insert: {
          applied_at?: string | null
          approval_date: string
          approved_by: string
          contract_id: string
          created_at?: string | null
          customer_id: string
          customer_name: string
          discount_amount: number
          discount_percentage?: number | null
          discount_reason: string
          discount_type: string
          final_amount: number
          id?: string
          issued_at?: string | null
          issued_by: string
          notes?: string | null
          original_amount: number
          requires_higher_approval?: boolean | null
          status?: string
          updated_at?: string | null
          voucher_number: string
        }
        Update: {
          applied_at?: string | null
          approval_date?: string
          approved_by?: string
          contract_id?: string
          created_at?: string | null
          customer_id?: string
          customer_name?: string
          discount_amount?: number
          discount_percentage?: number | null
          discount_reason?: string
          discount_type?: string
          final_amount?: number
          id?: string
          issued_at?: string | null
          issued_by?: string
          notes?: string | null
          original_amount?: number
          requires_higher_approval?: boolean | null
          status?: string
          updated_at?: string | null
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_vouchers_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_vouchers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing_log: {
        Row: {
          adjusted_price: number
          adjustment_reason: string | null
          applied_at: string | null
          id: string
          original_price: number
          rule_id: string | null
          vehicle_id: string
        }
        Insert: {
          adjusted_price: number
          adjustment_reason?: string | null
          applied_at?: string | null
          id?: string
          original_price: number
          rule_id?: string | null
          vehicle_id: string
        }
        Update: {
          adjusted_price?: number
          adjustment_reason?: string | null
          applied_at?: string | null
          id?: string
          original_price?: number
          rule_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_pricing_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "dynamic_pricing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing_rules: {
        Row: {
          base_price_adjustment: number | null
          competition_factors: Json | null
          created_at: string | null
          created_by: string | null
          demand_factors: Json | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          max_price_limit: number | null
          min_price_limit: number | null
          rule_name: string
          seasonal_factors: Json | null
          updated_at: string | null
          vehicle_criteria: Json | null
        }
        Insert: {
          base_price_adjustment?: number | null
          competition_factors?: Json | null
          created_at?: string | null
          created_by?: string | null
          demand_factors?: Json | null
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          max_price_limit?: number | null
          min_price_limit?: number | null
          rule_name: string
          seasonal_factors?: Json | null
          updated_at?: string | null
          vehicle_criteria?: Json | null
        }
        Update: {
          base_price_adjustment?: number | null
          competition_factors?: Json | null
          created_at?: string | null
          created_by?: string | null
          demand_factors?: Json | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          max_price_limit?: number | null
          min_price_limit?: number | null
          rule_name?: string
          seasonal_factors?: Json | null
          updated_at?: string | null
          vehicle_criteria?: Json | null
        }
        Relationships: []
      }
      failed_login_attempts: {
        Row: {
          attempt_time: string | null
          blocked_until: string | null
          email: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          attempt_time?: string | null
          blocked_until?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          attempt_time?: string | null
          blocked_until?: string | null
          email?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: []
      }
      financial_ai_predictions: {
        Row: {
          accuracy_metrics: Json | null
          confidence_score: number | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          input_features: Json | null
          model_version: string | null
          predicted_value: number
          prediction_date: string
          prediction_period: string
          prediction_type: string
          updated_at: string | null
        }
        Insert: {
          accuracy_metrics?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          input_features?: Json | null
          model_version?: string | null
          predicted_value: number
          prediction_date: string
          prediction_period?: string
          prediction_type: string
          updated_at?: string | null
        }
        Update: {
          accuracy_metrics?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          input_features?: Json | null
          model_version?: string | null
          predicted_value?: number
          prediction_date?: string
          prediction_period?: string
          prediction_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_anomalies: {
        Row: {
          actual_value: number | null
          anomaly_score: number
          anomaly_type: string
          context_data: Json | null
          created_at: string | null
          detected_at: string | null
          deviation_percentage: number | null
          entity_id: string | null
          entity_type: string
          expected_value: number | null
          id: string
          investigation_status: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          actual_value?: number | null
          anomaly_score: number
          anomaly_type: string
          context_data?: Json | null
          created_at?: string | null
          detected_at?: string | null
          deviation_percentage?: number | null
          entity_id?: string | null
          entity_type: string
          expected_value?: number | null
          id?: string
          investigation_status?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          actual_value?: number | null
          anomaly_score?: number
          anomaly_type?: string
          context_data?: Json | null
          created_at?: string | null
          detected_at?: string | null
          deviation_percentage?: number | null
          entity_id?: string | null
          entity_type?: string
          expected_value?: number | null
          id?: string
          investigation_status?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      financial_warnings: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          amount: number
          available_balance: number
          created_at: string | null
          created_by: string | null
          deficit: number
          id: string
          owner_id: string | null
          voucher_id: string | null
          warning_message: string
          warning_type: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          amount: number
          available_balance: number
          created_at?: string | null
          created_by?: string | null
          deficit: number
          id?: string
          owner_id?: string | null
          voucher_id?: string | null
          warning_message: string
          warning_type: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          amount?: number
          available_balance?: number
          created_at?: string | null
          created_by?: string | null
          deficit?: number
          id?: string
          owner_id?: string | null
          voucher_id?: string | null
          warning_message?: string
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_warnings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vehicle_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_warnings_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "payment_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category_id: string | null
          created_at: string
          current_stock: number
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          location: string | null
          maximum_stock: number | null
          minimum_stock: number
          name: string
          reorder_point: number | null
          selling_price: number | null
          sku: string | null
          supplier_id: string | null
          unit_cost: number
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          name: string
          reorder_point?: number | null
          selling_price?: number | null
          sku?: string | null
          supplier_id?: string | null
          unit_cost?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          name?: string
          reorder_point?: number | null
          selling_price?: number | null
          sku?: string | null
          supplier_id?: string | null
          unit_cost?: number
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_order: number
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_order: number
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_order?: number
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          approved_by: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string | null
          notes: string | null
          paid_amount: number
          payment_terms: string | null
          period_end: string | null
          period_start: string | null
          sent_at: string | null
          status: string
          subtotal: number
          tax_amount: number
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          vat_rate: number | null
          vehicle_id: string | null
        }
        Insert: {
          approved_by?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_type?: string | null
          notes?: string | null
          paid_amount?: number
          payment_terms?: string | null
          period_end?: string | null
          period_start?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_rate?: number | null
          vehicle_id?: string | null
        }
        Update: {
          approved_by?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string | null
          notes?: string | null
          paid_amount?: number
          payment_terms?: string | null
          period_end?: string | null
          period_start?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          vat_rate?: number | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          id: string
          profitability_snapshot_id: string | null
          reference_id: string | null
          reference_type: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          id?: string
          profitability_snapshot_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          id?: string
          profitability_snapshot_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_profitability_snapshot_id_fkey"
            columns: ["profitability_snapshot_id"]
            isOneToOne: false
            referencedRelation: "profitability_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          journal_entry_id: string
          line_order: number
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id: string
          line_order: number
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          journal_entry_id?: string
          line_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_oils_used: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          maintenance_id: string
          notes: string | null
          quantity_used: number
          total_cost: number | null
          unit_cost: number
          viscosity: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          maintenance_id: string
          notes?: string | null
          quantity_used: number
          total_cost?: number | null
          unit_cost?: number
          viscosity?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          maintenance_id?: string
          notes?: string | null
          quantity_used?: number
          total_cost?: number | null
          unit_cost?: number
          viscosity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_oils_used_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_oils_used_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "vehicle_maintenance"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_parts_used: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          maintenance_id: string
          notes: string | null
          quantity_used: number
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          maintenance_id: string
          notes?: string | null
          quantity_used: number
          total_cost?: number | null
          unit_cost?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          maintenance_id?: string
          notes?: string | null
          quantity_used?: number
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_parts_used_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_parts_used_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "vehicle_maintenance"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          predicted_date: string | null
          predicted_mileage: number | null
          prediction_type: string
          recommendations: Json | null
          status: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_date?: string | null
          predicted_mileage?: number | null
          prediction_type?: string
          recommendations?: Json | null
          status?: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          predicted_date?: string | null
          predicted_mileage?: number | null
          prediction_type?: string
          recommendations?: Json | null
          status?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_predictions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          maintenance_type: string
          notes: string | null
          priority: string
          scheduled_date: string
          scheduled_mileage: number | null
          status: string
          template_id: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          maintenance_type: string
          notes?: string | null
          priority?: string
          scheduled_date: string
          scheduled_mileage?: number | null
          status?: string
          template_id?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          priority?: string
          scheduled_date?: string
          scheduled_mileage?: number | null
          status?: string
          template_id?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_templates: {
        Row: {
          checklist_items: string[] | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          is_active: boolean
          maintenance_type: string
          name: string
          required_parts: Json | null
          updated_at: string
        }
        Insert: {
          checklist_items?: string[] | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean
          maintenance_type: string
          name: string
          required_parts?: Json | null
          updated_at?: string
        }
        Update: {
          checklist_items?: string[] | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean
          maintenance_type?: string
          name?: string
          required_parts?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_work_hours: {
        Row: {
          break_hours: number | null
          created_at: string | null
          end_time: string | null
          hourly_rate: number
          id: string
          maintenance_id: string
          mechanic_id: string
          notes: string | null
          start_time: string
          total_cost: number | null
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          break_hours?: number | null
          created_at?: string | null
          end_time?: string | null
          hourly_rate?: number
          id?: string
          maintenance_id: string
          mechanic_id: string
          notes?: string | null
          start_time: string
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          break_hours?: number | null
          created_at?: string | null
          end_time?: string | null
          hourly_rate?: number
          id?: string
          maintenance_id?: string
          mechanic_id?: string
          notes?: string | null
          start_time?: string
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_work_hours_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "vehicle_maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_work_hours_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanics: {
        Row: {
          created_at: string
          email: string | null
          employee_id: string | null
          hire_date: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          specializations: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          employee_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          specializations?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          employee_id?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          specializations?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          delivery_method: string
          error_message: string | null
          id: string
          notification_id: string
          recipient_info: Json | null
          sent_at: string
          status: string
        }
        Insert: {
          delivery_method: string
          error_message?: string | null
          id?: string
          notification_id: string
          recipient_info?: Json | null
          sent_at?: string
          status?: string
        }
        Update: {
          delivery_method?: string
          error_message?: string | null
          id?: string
          notification_id?: string
          recipient_info?: Json | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category_preferences: Json | null
          created_at: string
          digest_enabled: boolean | null
          digest_frequency: string | null
          digest_time: string | null
          email_enabled: boolean | null
          enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          reminder_enabled: boolean | null
          reminder_intervals: number[] | null
          sms_enabled: boolean | null
          updated_at: string
          user_id: string
          weekend_notifications: boolean | null
        }
        Insert: {
          category_preferences?: Json | null
          created_at?: string
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          digest_time?: string | null
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_enabled?: boolean | null
          reminder_intervals?: number[] | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id: string
          weekend_notifications?: boolean | null
        }
        Update: {
          category_preferences?: Json | null
          created_at?: string
          digest_enabled?: boolean | null
          digest_frequency?: string | null
          digest_time?: string | null
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          reminder_enabled?: boolean | null
          reminder_intervals?: number[] | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          weekend_notifications?: boolean | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          advance_days: number | null
          created_at: string
          email_enabled: boolean | null
          enabled: boolean | null
          id: string
          notification_type: string
          push_enabled: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          advance_days?: number | null
          created_at?: string
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          notification_type: string
          push_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          advance_days?: number | null
          created_at?: string
          email_enabled?: boolean | null
          enabled?: boolean | null
          id?: string
          notification_type?: string
          push_enabled?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          auto_send: boolean | null
          category: string
          created_at: string
          created_by: string | null
          default_channels: string[] | null
          default_priority: string | null
          id: string
          is_active: boolean | null
          name: string
          required_variables: string[] | null
          templates: Json
          type: string
          updated_at: string
        }
        Insert: {
          auto_send?: boolean | null
          category: string
          created_at?: string
          created_by?: string | null
          default_channels?: string[] | null
          default_priority?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          required_variables?: string[] | null
          templates?: Json
          type: string
          updated_at?: string
        }
        Update: {
          auto_send?: boolean | null
          category?: string
          created_at?: string
          created_by?: string | null
          default_channels?: string[] | null
          default_priority?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          required_variables?: string[] | null
          templates?: Json
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_required: boolean | null
          auto_generated: boolean | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          scheduled_for: string | null
          severity: string
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_required?: boolean | null
          auto_generated?: boolean | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          scheduled_for?: string | null
          severity?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_required?: boolean | null
          auto_generated?: boolean | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          scheduled_for?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          account_id: string | null
          amount: number
          bank_details: string | null
          check_number: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          contract_id: string | null
          created_at: string | null
          customer_id: string
          customer_name: string
          deposited_at: string | null
          email_sent_at: string | null
          id: string
          invoice_id: string | null
          invoice_number: string | null
          issued_at: string | null
          issued_by: string | null
          journal_entry_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          plate_number: string | null
          printed_at: string | null
          receipt_number: string
          receipt_type: string
          reference_number: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          bank_details?: string | null
          check_number?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          customer_id: string
          customer_name: string
          deposited_at?: string | null
          email_sent_at?: string | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          issued_at?: string | null
          issued_by?: string | null
          journal_entry_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method: string
          plate_number?: string | null
          printed_at?: string | null
          receipt_number: string
          receipt_type: string
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          bank_details?: string | null
          check_number?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          customer_id?: string
          customer_name?: string
          deposited_at?: string | null
          email_sent_at?: string | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          issued_at?: string | null
          issued_by?: string | null
          journal_entry_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          plate_number?: string | null
          printed_at?: string | null
          receipt_number?: string
          receipt_type?: string
          reference_number?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_vouchers: {
        Row: {
          account_id: string | null
          amount: number
          approval_date: string | null
          approval_notes: string | null
          approved_by: string | null
          bank_details: string | null
          check_number: string | null
          contract_id: string | null
          created_at: string | null
          currency: string | null
          description: string
          expense_category: string
          expense_type: string
          id: string
          invoice_id: string | null
          invoice_number: string | null
          issued_at: string | null
          issued_by: string
          journal_entry_id: string | null
          maintenance_id: string | null
          notes: string | null
          paid_at: string | null
          payment_date: string
          payment_method: string
          printed_at: string | null
          purchase_order_id: string | null
          recipient_account: string | null
          recipient_id: string | null
          recipient_name: string
          recipient_phone: string | null
          recipient_type: string
          reference_number: string | null
          requested_by: string
          requires_higher_approval: boolean | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          vehicle_id: string | null
          voucher_number: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          approval_date?: string | null
          approval_notes?: string | null
          approved_by?: string | null
          bank_details?: string | null
          check_number?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          expense_category: string
          expense_type: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          issued_at?: string | null
          issued_by: string
          journal_entry_id?: string | null
          maintenance_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_date: string
          payment_method: string
          printed_at?: string | null
          purchase_order_id?: string | null
          recipient_account?: string | null
          recipient_id?: string | null
          recipient_name: string
          recipient_phone?: string | null
          recipient_type: string
          reference_number?: string | null
          requested_by: string
          requires_higher_approval?: boolean | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          voucher_number: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          approval_date?: string | null
          approval_notes?: string | null
          approved_by?: string | null
          bank_details?: string | null
          check_number?: string | null
          contract_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          expense_category?: string
          expense_type?: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          issued_at?: string | null
          issued_by?: string
          journal_entry_id?: string | null
          maintenance_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_date?: string
          payment_method?: string
          printed_at?: string | null
          purchase_order_id?: string | null
          recipient_account?: string | null
          recipient_id?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          recipient_type?: string
          reference_number?: string | null
          requested_by?: string
          requires_higher_approval?: boolean | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_vouchers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rental_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "vehicle_maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_vouchers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name: string
          hire_date?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profitability_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          notification_config: Json
          threshold_config: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_config?: Json
          threshold_config?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          notification_config?: Json
          threshold_config?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profitability_snapshots: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metrics: Json
          period_end: string
          period_start: string
          snapshot_date: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          snapshot_date: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          snapshot_date?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          discount_amount: number
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date: string
          order_number: string
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_contracts: {
        Row: {
          accrued_amount: number
          actual_return_date: string | null
          additional_charges: number | null
          contract_number: string
          created_at: string | null
          created_by: string | null
          credit_limit_override: number | null
          customer_id: string
          customer_signature: string | null
          daily_rate: number
          deposit_amount: number | null
          discount_amount: number | null
          employee_signature: string | null
          end_date: string
          fuel_level_end: string | null
          fuel_level_start: string | null
          id: string
          insurance_amount: number | null
          mileage_end: number | null
          mileage_start: number | null
          notes: string | null
          outstanding_amount: number
          paid_amount: number | null
          payment_method: string | null
          payment_status: string | null
          pickup_location: string | null
          remaining_amount: number | null
          return_location: string | null
          signed_at: string | null
          start_date: string
          status: string | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          accrued_amount?: number
          actual_return_date?: string | null
          additional_charges?: number | null
          contract_number: string
          created_at?: string | null
          created_by?: string | null
          credit_limit_override?: number | null
          customer_id: string
          customer_signature?: string | null
          daily_rate: number
          deposit_amount?: number | null
          discount_amount?: number | null
          employee_signature?: string | null
          end_date: string
          fuel_level_end?: string | null
          fuel_level_start?: string | null
          id?: string
          insurance_amount?: number | null
          mileage_end?: number | null
          mileage_start?: number | null
          notes?: string | null
          outstanding_amount?: number
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          remaining_amount?: number | null
          return_location?: string | null
          signed_at?: string | null
          start_date: string
          status?: string | null
          terms_conditions?: string | null
          total_amount: number
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          accrued_amount?: number
          actual_return_date?: string | null
          additional_charges?: number | null
          contract_number?: string
          created_at?: string | null
          created_by?: string | null
          credit_limit_override?: number | null
          customer_id?: string
          customer_signature?: string | null
          daily_rate?: number
          deposit_amount?: number | null
          discount_amount?: number | null
          employee_signature?: string | null
          end_date?: string
          fuel_level_end?: string | null
          fuel_level_start?: string | null
          id?: string
          insurance_amount?: number | null
          mileage_end?: number | null
          mileage_start?: number | null
          notes?: string | null
          outstanding_amount?: number
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: string | null
          remaining_amount?: number | null
          return_location?: string | null
          signed_at?: string | null
          start_date?: string
          status?: string | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_contracts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_report_settings: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          report_name: string
          report_type: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          report_name: string
          report_type: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          report_name?: string
          report_type?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          next_run_at: string | null
          recipients: string[]
          report_name: string
          report_type: string
          schedule_config: Json
          schedule_type: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_run_at?: string | null
          recipients?: string[]
          report_name: string
          report_type: string
          schedule_config?: Json
          schedule_type?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          next_run_at?: string | null
          recipients?: string[]
          report_name?: string
          report_type?: string
          schedule_config?: Json
          schedule_type?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_alert_log: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_data: Json | null
          created_at: string | null
          entity_id: string | null
          id: string
          notification_sent: boolean | null
          rule_id: string | null
          threshold_value: number | null
          trigger_value: number | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_data?: Json | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          notification_sent?: boolean | null
          rule_id?: string | null
          threshold_value?: number | null
          trigger_value?: number | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_data?: Json | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          notification_sent?: boolean | null
          rule_id?: string | null
          threshold_value?: number | null
          trigger_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_alert_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "smart_alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_alert_rules: {
        Row: {
          alert_template: Json
          conditions: Json
          created_at: string | null
          created_by: string | null
          entity_type: string
          id: string
          is_active: boolean | null
          rule_name: string
          rule_type: string
          severity_level: string | null
          updated_at: string | null
        }
        Insert: {
          alert_template: Json
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          entity_type: string
          id?: string
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          severity_level?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_template?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          entity_type?: string
          id?: string
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          severity_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smart_notifications: {
        Row: {
          action_data: Json | null
          action_required: boolean | null
          action_taken: boolean | null
          auto_generated: boolean | null
          category: string
          created_at: string
          created_by: string | null
          delivery_channels: string[] | null
          delivery_status: Json | null
          expires_at: string | null
          id: string
          interaction_count: number | null
          last_interaction_at: string | null
          message: string
          priority: string
          recurring: boolean | null
          recurring_pattern: Json | null
          reference_data: Json | null
          reference_id: string | null
          reference_type: string | null
          reminder_sent: boolean | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          target_departments: string[] | null
          target_roles: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_required?: boolean | null
          action_taken?: boolean | null
          auto_generated?: boolean | null
          category: string
          created_at?: string
          created_by?: string | null
          delivery_channels?: string[] | null
          delivery_status?: Json | null
          expires_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          message: string
          priority?: string
          recurring?: boolean | null
          recurring_pattern?: Json | null
          reference_data?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          reminder_sent?: boolean | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_departments?: string[] | null
          target_roles?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_required?: boolean | null
          action_taken?: boolean | null
          auto_generated?: boolean | null
          category?: string
          created_at?: string
          created_by?: string | null
          delivery_channels?: string[] | null
          delivery_status?: Json | null
          expires_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          message?: string
          priority?: string
          recurring?: boolean | null
          recurring_pattern?: Json | null
          reference_data?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          reminder_sent?: boolean | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_departments?: string[] | null
          target_roles?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stock_transactions: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          transaction_date: string
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          transaction_date?: string
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          payment_terms: string | null
          phone: string | null
          rating: number | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          advance_days: number | null
          created_at: string
          email_enabled: boolean
          enabled: boolean
          id: string
          notification_type: string
          push_enabled: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          advance_days?: number | null
          created_at?: string
          email_enabled?: boolean
          enabled?: boolean
          id?: string
          notification_type: string
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          advance_days?: number | null
          created_at?: string
          email_enabled?: boolean
          enabled?: boolean
          id?: string
          notification_type?: string
          push_enabled?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: string
          name: string
          status: string
          type: string
          upload_date: string
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          name: string
          status?: string
          type: string
          upload_date?: string
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          upload_date?: string
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          description: string | null
          id: string
          type: string
          upload_date: string
          uploaded_by: string | null
          url: string
          vehicle_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          type?: string
          upload_date?: string
          uploaded_by?: string | null
          url: string
          vehicle_id: string
        }
        Update: {
          description?: string | null
          id?: string
          type?: string
          upload_date?: string
          uploaded_by?: string | null
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_location: {
        Row: {
          address: string | null
          id: string
          is_tracked: boolean
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          vehicle_id: string
        }
        Insert: {
          address?: string | null
          id?: string
          is_tracked?: boolean
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          vehicle_id: string
        }
        Update: {
          address?: string | null
          id?: string
          is_tracked?: boolean
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_location_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance: {
        Row: {
          actual_duration_hours: number | null
          completed_date: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          images: string[] | null
          labor_cost: number | null
          labor_hours: number | null
          maintenance_type: string
          mechanic_id: string | null
          notes: string | null
          oils_used: Json | null
          parts_cost: number | null
          parts_used: string[] | null
          scheduled_date: string | null
          status: string
          template_id: string | null
          total_cost: number | null
          updated_at: string
          vehicle_id: string
          warranty_until: string | null
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          actual_duration_hours?: number | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          labor_cost?: number | null
          labor_hours?: number | null
          maintenance_type: string
          mechanic_id?: string | null
          notes?: string | null
          oils_used?: Json | null
          parts_cost?: number | null
          parts_used?: string[] | null
          scheduled_date?: string | null
          status?: string
          template_id?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id: string
          warranty_until?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          actual_duration_hours?: number | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          labor_cost?: number | null
          labor_hours?: number | null
          maintenance_type?: string
          mechanic_id?: string | null
          notes?: string | null
          oils_used?: Json | null
          parts_cost?: number | null
          parts_used?: string[] | null
          scheduled_date?: string | null
          status?: string
          template_id?: string | null
          total_cost?: number | null
          updated_at?: string
          vehicle_id?: string
          warranty_until?: string | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "mechanics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_owners: {
        Row: {
          account_id: string | null
          address: string | null
          bank_account: string | null
          commission_rate: number | null
          created_at: string
          email: string | null
          iban: string | null
          id: string
          is_active: boolean
          last_payment_date: string | null
          name: string
          national_id: string | null
          paid_commission: number | null
          payment_frequency: string | null
          pending_commission: number | null
          phone: string | null
          total_commission: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          address?: string | null
          bank_account?: string | null
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean
          last_payment_date?: string | null
          name: string
          national_id?: string | null
          paid_commission?: number | null
          payment_frequency?: string | null
          pending_commission?: number | null
          phone?: string | null
          total_commission?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          address?: string | null
          bank_account?: string | null
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean
          last_payment_date?: string | null
          name?: string
          national_id?: string | null
          paid_commission?: number | null
          payment_frequency?: string | null
          pending_commission?: number | null
          phone?: string | null
          total_commission?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_owners_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          chassis_number: string | null
          color: string
          created_at: string
          created_by: string | null
          daily_rate: number
          engine_number: string | null
          features: string[] | null
          fuel_type: string
          id: string
          mileage: number
          model: string
          notes: string | null
          owner_id: string | null
          plate_number: string
          registration_expiry: string | null
          seating_capacity: number
          status: string
          transmission: string
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          brand: string
          chassis_number?: string | null
          color: string
          created_at?: string
          created_by?: string | null
          daily_rate?: number
          engine_number?: string | null
          features?: string[] | null
          fuel_type?: string
          id?: string
          mileage?: number
          model: string
          notes?: string | null
          owner_id?: string | null
          plate_number: string
          registration_expiry?: string | null
          seating_capacity?: number
          status?: string
          transmission?: string
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          brand?: string
          chassis_number?: string | null
          color?: string
          created_at?: string
          created_by?: string | null
          daily_rate?: number
          engine_number?: string | null
          features?: string[] | null
          fuel_type?: string
          id?: string
          mileage?: number
          model?: string
          notes?: string | null
          owner_id?: string | null
          plate_number?: string
          registration_expiry?: string | null
          seating_capacity?: number
          status?: string
          transmission?: string
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicles_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "vehicle_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          amount: number
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          bank_account: string | null
          beneficiary_name: string
          beneficiary_type: string
          check_number: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          status: string
          updated_at: string
          voucher_date: string
          voucher_number: string
          voucher_type: string
        }
        Insert: {
          amount: number
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account?: string | null
          beneficiary_name: string
          beneficiary_type: string
          check_number?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          updated_at?: string
          voucher_date: string
          voucher_number: string
          voucher_type: string
        }
        Update: {
          amount?: number
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account?: string | null
          beneficiary_name?: string
          beneficiary_type?: string
          check_number?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          updated_at?: string
          voucher_date?: string
          voucher_number?: string
          voucher_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_customer_behavior: {
        Args: { p_customer_id: string }
        Returns: Json
      }
      calculate_maintenance_total_cost: {
        Args: { maintenance_record_id: string }
        Returns: number
      }
      check_profitability_thresholds: {
        Args: Record<PropertyKey, never>
        Returns: {
          alert_type: string
          current_value: number
          entity_id: string
          entity_name: string
          entity_type: string
          severity: string
          threshold_value: number
        }[]
      }
      cleanup_old_activity_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_smart_notification: {
        Args: {
          p_action_required?: boolean
          p_category?: string
          p_delivery_channels?: string[]
          p_message: string
          p_priority?: string
          p_reference_data?: Json
          p_reference_id?: string
          p_reference_type?: string
          p_scheduled_for?: string
          p_target_roles?: string[]
          p_title: string
          p_type?: string
          p_user_id?: string
        }
        Returns: string
      }
      detect_financial_anomalies: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      ensure_cost_center_for_entity: {
        Args: {
          p_center_code?: string
          p_center_name?: string
          p_entity_id: string
          p_entity_type: string
        }
        Returns: string
      }
      generate_discount_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_financial_predictions: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_prediction_months?: number
        }
        Returns: Json
      }
      generate_maintenance_predictions: {
        Args: { p_vehicle_id: string }
        Returns: Json
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_voucher_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_owner_balance: {
        Args: { p_owner_id: string }
        Returns: Json
      }
      get_profitability_comparison: {
        Args: {
          p_current_end: string
          p_current_start: string
          p_entity_id: string
          p_entity_type: string
          p_previous_end: string
          p_previous_start: string
        }
        Returns: Json
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_permission: {
        Args: { _permission_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_ip_blocked: {
        Args: { p_ip_address: unknown }
        Returns: boolean
      }
      save_profitability_snapshot: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_metrics: Json
          p_period_end: string
          p_period_start: string
        }
        Returns: string
      }
      track_failed_login: {
        Args: { p_email: string; p_ip_address: unknown; p_user_agent?: string }
        Returns: boolean
      }
      validate_password_strength: {
        Args: { password_text: string }
        Returns: Json
      }
      validate_voucher_payment: {
        Args: { p_amount: number; p_owner_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "accountant" | "employee" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "accountant", "employee", "manager"],
    },
  },
} as const
