import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { axiosInstance } from '../../services/axiosConfig';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity?: number;
  category?: string;
  is_available?: boolean;
  image_url?: string;
  file_url?: string;
  owner_id?: string;
  createdAt?: string;
}

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { productId: string } }, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    is_available: true,
  });

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching product details for:', productId);
      const response = await axiosInstance.get(`/products/${productId}`);
      console.log('Product details FULL:', JSON.stringify(response.data, null, 2));
      console.log('Product owner_id:', response.data.owner_id);
      console.log('Current user FULL:', JSON.stringify(user, null, 2));
      console.log('Current user id:', user?.id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = () => {
    if (product) {
      setEditForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock_quantity: product.stock_quantity?.toString() || '0',
        category: product.category || '',
        is_available: product.is_available ?? true,
      });
      setSelectedImage(null);
      setSelectedFile(null);
      setModalVisible(true);
    }
  };


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editForm.name.trim() || !editForm.price.trim()) {
      Alert.alert('Error', 'Please fill in required fields (Name and Price)');
      return;
    }

    const price = parseFloat(editForm.price);
    if (isNaN(price) || price < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const stockQuantity = parseInt(editForm.stock_quantity) || 0;
    if (stockQuantity < 0) {
      Alert.alert('Error', 'Stock quantity cannot be negative');
      return;
    }

    try {
      setUpdating(true);
      const formData = new FormData();
      
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', price.toString());
      formData.append('stock_quantity', stockQuantity.toString());
      formData.append('category', editForm.category);
      formData.append('is_available', editForm.is_available.toString());

      // Add image if selected
      if (selectedImage) {
        const imageFile: any = {
          uri: selectedImage.uri,
          type: selectedImage.mimeType || 'image/jpeg',
          name: selectedImage.fileName || `image_${Date.now()}.jpg`,
        };
        formData.append('image', imageFile);
      }

      // Add file if selected
      if (selectedFile) {
        const file: any = {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name || `file_${Date.now()}`,
        };
        formData.append('file', file);
      }

      const response = await axiosInstance.put(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProduct(response.data);
      setModalVisible(false);
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  };


  const handleDelete = () => {
    return null;
  };

  // Convert both IDs to strings for comparison to handle type mismatches
  const isOwner = isAuthenticated && user?.id && product?.owner_id &&
    String(user.id) === String(product.owner_id);

  console.log('Is user owner of the product?', isOwner, 'Product owner:', product?.owner_id, 'User ID:', user?.id, 'Types:', typeof product?.owner_id, typeof user?.id);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
          </View>

          {isOwner && (
            <View style={styles.ownerActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete Product</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Product</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  placeholder="Enter product name"
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                  placeholder="Enter product description"
                  placeholderTextColor={colors.text.secondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.price}
                  onChangeText={(text) => setEditForm({ ...editForm, price: text })}
                  placeholder="Enter price"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Stock Quantity</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.stock_quantity}
                  onChangeText={(text) => setEditForm({ ...editForm, stock_quantity: text })}
                  placeholder="Enter stock quantity"
                  placeholderTextColor={colors.text.secondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.category}
                  onChangeText={(text) => setEditForm({ ...editForm, category: text })}
                  placeholder="Enter category"
                  placeholderTextColor={colors.text.secondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Availability</Text>
                <TouchableOpacity
                  style={styles.switchContainer}
                  onPress={() => setEditForm({ ...editForm, is_available: !editForm.is_available })}
                >
                  <View style={[styles.switch, editForm.is_available && styles.switchActive]}>
                    <View style={[styles.switchThumb, editForm.is_available && styles.switchThumbActive]} />
                  </View>
                  <Text style={styles.switchLabel}>
                    {editForm.is_available ? 'Available' : 'Not Available'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Image</Text>
                <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
                  <Text style={styles.fileButtonText}>
                    {selectedImage ? 'Change Image' : 'Select Image'}
                  </Text>
                </TouchableOpacity>
                {selectedImage && (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!selectedImage && product?.image_url && (
                  <Text style={styles.currentFileText}>Current: {product.image_url.split('/').pop()}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Attachment File</Text>
                <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
                  <Text style={styles.fileButtonText}>
                    {selectedFile ? 'Change File' : 'Select File'}
                  </Text>
                </TouchableOpacity>
                {selectedFile && (
                  <View style={styles.fileInfoContainer}>
                    <Text style={styles.fileInfoText}>{selectedFile.name}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!selectedFile && product?.file_url && (
                  <Text style={styles.currentFileText}>Current: {product.file_url.split('/').pop()}</Text>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                  disabled={updating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateProduct}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color={colors.text.inverse} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing.lg,
  },
  productName: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  productPrice: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  productDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  ownerActions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.xl,
    margin: spacing.lg,
    marginTop: spacing.xl * 2,
    marginBottom: spacing.xl * 2,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  switchLabel: {
    ...typography.body,
    color: colors.text.primary,
  },
  fileButton: {
    backgroundColor: colors.border,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  fileButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  previewContainer: {
    marginTop: spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  fileInfoContainer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfoText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
  },
  removeButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  removeButtonText: {
    ...typography.body,
    color: colors.text.inverse,
    fontSize: 12,
  },
  currentFileText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
});

export default ProductDetail;