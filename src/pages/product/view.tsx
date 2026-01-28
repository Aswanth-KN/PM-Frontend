import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector } from '../../store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { axiosInstance } from '../../services/axiosConfig';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  userId?: string;
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

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching product details for:', productId);
      const response = await axiosInstance.get(`/products/${productId}`);
      console.log('Product details:', response.data);
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
      navigation.navigate('EditProduct', { productId: product.id });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/products/${productId}`);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const isOwner = isAuthenticated && user?.id === product?.userId;

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
});

export default ProductDetail;