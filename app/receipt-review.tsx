import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, uploadReceipt } from '../lib/api';
import type { ParsedReceipt } from '../lib/receipt-parser';

interface Category {
  id: string;
  name: string;
}

export default function ReceiptReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri: string;
    parsedData: string;
    rawText: string;
  }>();

  const parsed: ParsedReceipt = JSON.parse(params.parsedData || '{}');

  const [merchantName, setMerchantName] = useState(parsed.merchant_name ?? '');
  const [date, setDate] = useState(parsed.date ?? '');
  const [totalAmount, setTotalAmount] = useState(
    parsed.total_amount != null ? String(parsed.total_amount) : '',
  );
  const [vatAmount, setVatAmount] = useState(
    parsed.vat_amount != null ? String(parsed.vat_amount) : '',
  );
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<Category[]>('/api/expenses/categories')
      .then(setCategories)
      .catch(() => {});
  }, []);

  const exclVat = (() => {
    const total = parseFloat(totalAmount);
    const vat = parseFloat(vatAmount);
    if (!isNaN(total) && !isNaN(vat)) {
      return (total - vat).toFixed(2);
    }
    return '';
  })();

  const handleSave = async () => {
    if (!params.imageUri) {
      Alert.alert('Error', 'No image to upload');
      return;
    }

    setSaving(true);
    try {
      await uploadReceipt(params.imageUri, {
        merchant_name: merchantName || null,
        date: date || null,
        total_amount: totalAmount ? parseFloat(totalAmount) : null,
        vat_amount: vatAmount ? parseFloat(vatAmount) : null,
        excl_vat_amount: exclVat ? parseFloat(exclVat) : null,
        vat_number: parsed.vat_number,
        category_id: categoryId,
        line_items: parsed.line_items ?? [],
      });
      setSaved(true);
    } catch (error: any) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#28a745" />
        </View>
        <Text style={styles.successTitle}>Receipt Saved!</Text>
        <Text style={styles.successText}>
          Your receipt has been processed and saved successfully.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/scan')}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Scan Another</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryButton, { marginTop: 12 }]}
          onPress={() => router.replace('/(tabs)/expenses')}
        >
          <Text style={styles.secondaryButtonText}>View Expenses</Text>
        </Pressable>
      </View>
    );
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Receipt image */}
        {params.imageUri && (
          <Image
            source={{ uri: params.imageUri }}
            style={styles.receiptImage}
            resizeMode="contain"
          />
        )}

        {/* Form fields */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Receipt Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Merchant Name</Text>
            <TextInput
              style={styles.input}
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="e.g. Engen, Shell, Sasol"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Total (R)</Text>
              <TextInput
                style={styles.input}
                value={totalAmount}
                onChangeText={setTotalAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>VAT (R)</Text>
              <TextInput
                style={styles.input}
                value={vatAmount}
                onChangeText={setVatAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {exclVat ? (
            <View style={styles.calculated}>
              <Text style={styles.calculatedLabel}>Excl. VAT</Text>
              <Text style={styles.calculatedValue}>R {exclVat}</Text>
            </View>
          ) : null}

          {parsed.vat_number && (
            <View style={styles.calculated}>
              <Text style={styles.calculatedLabel}>VAT Number</Text>
              <Text style={styles.calculatedValue}>{parsed.vat_number}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              style={styles.picker}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={selectedCategory ? styles.pickerText : styles.pickerPlaceholder}>
                {selectedCategory?.name ?? 'Select a category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>
            {showCategoryPicker && (
              <View style={styles.dropdown}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.dropdownItem,
                      cat.id === categoryId && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        cat.id === categoryId && styles.dropdownTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
                {categories.length === 0 && (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>No categories available</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Line items */}
          {parsed.line_items?.length > 0 && (
            <View style={styles.lineItems}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              {parsed.line_items.map((item, index) => (
                <View key={index} style={styles.lineItem}>
                  <Text style={styles.lineItemDesc}>{item.description}</Text>
                  <Text style={styles.lineItemAmount}>R {item.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="cloud-upload" size={20} color="#fff" />
          )}
          <Text style={styles.primaryButtonText}>
            {saving ? 'Saving...' : 'Save Receipt'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { paddingBottom: 100 },
  receiptImage: { width: '100%', height: 250, backgroundColor: '#000' },
  form: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F4E79', marginBottom: 12 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', gap: 12 },
  calculated: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E8F0F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  calculatedLabel: { fontSize: 14, color: '#555' },
  calculatedValue: { fontSize: 14, fontWeight: '600', color: '#1F4E79' },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerText: { fontSize: 16, color: '#333' },
  pickerPlaceholder: { fontSize: 16, color: '#999' },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  dropdownItem: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  dropdownItemActive: { backgroundColor: '#E8F0F8' },
  dropdownText: { fontSize: 15, color: '#333' },
  dropdownTextActive: { color: '#1F4E79', fontWeight: '600' },
  lineItems: { marginTop: 8 },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  lineItemDesc: { fontSize: 14, color: '#333', flex: 1 },
  lineItemAmount: { fontSize: 14, fontWeight: '600', color: '#1F4E79' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F4E79',
    borderRadius: 8,
    paddingVertical: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 14,
  },
  secondaryButtonText: { color: '#1F4E79', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F4E79' },
  successText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
});
