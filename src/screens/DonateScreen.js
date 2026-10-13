import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useApp } from '../context/AppContext';
import imageService from '../services/imageService';

const CATEGORIES = [
  'Cooked Meals',
  'Bakery & Bread',
  'Fruits & Vegetables',
  'Packaged & Groceries',
  'Dairy & Beverages',
];

const PRESET_IMAGES = [
  { label: 'Cooked Meals', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80' },
  { label: 'Bakery Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80' },
  { label: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80' },
  { label: 'Rice & Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
];

export const DonateScreen = ({ navigation }) => {
  const { role, switchRole, profile, userLocation, addDonation } = useApp();

  // Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('meal boxes');
  const [description, setDescription] = useState('');
  const [preparedAt, setPreparedAt] = useState('Today, 2:00 PM');
  const [pickupDeadline, setPickupDeadline] = useState('Today, 8:30 PM');
  const [pickupAddress, setPickupAddress] = useState(profile?.address || userLocation.address || '42 MG Road, Sector 4');
  const [donorPhone, setDonorPhone] = useState(profile?.phone || '+91 98765 43210');
  const [dietary, setDietary] = useState('Vegetarian');
  const [imageUri, setImageUri] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validate form
  const validate = () => {
    const errs = {};
    if (!foodName.trim()) errs.foodName = 'Food name is required';
    if (!quantity.trim()) {
      errs.quantity = 'Quantity is required';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      errs.quantity = 'Please enter a valid positive number';
    }
    if (!pickupDeadline.trim()) errs.pickupDeadline = 'Pickup deadline is required';
    if (!pickupAddress.trim()) errs.pickupAddress = 'Pickup address is required';
    if (!donorPhone.trim()) errs.donorPhone = 'Contact phone number is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePickGallery = async () => {
    setShowImageModal(false);
    const uri = await imageService.pickImageFromGallery();
    if (uri) setImageUri(uri);
  };

  const handleTakePhoto = async () => {
    setShowImageModal(false);
    const uri = await imageService.takePhotoWithCamera();
    if (uri) setImageUri(uri);
  };

  const handleSelectPreset = (url) => {
    setImageUri(url);
    setShowImageModal(false);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Form Incomplete', 'Please fill in all required fields marked with an asterisk (*).');
      return;
    }

    try {
      setIsSubmitting(true);

      const donationData = {
        foodName: foodName.trim(),
        category,
        quantity: quantity.trim(),
        unit: unit.trim(),
        description: description.trim() || 'Fresh surplus food available for immediate pickup and distribution.',
        preparedAt: preparedAt.trim(),
        pickupDeadline: pickupDeadline.trim(),
        pickupAddress: pickupAddress.trim(),
        donorPhone: donorPhone.trim(),
        donorName: profile?.name || 'Local Donor',
        dietary,
        imageUrl: imageUri || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };

      const result = await addDonation(donationData);

      if (result.success) {
        setShowSuccessModal(true);
        // Reset form
        setFoodName('');
        setQuantity('');
        setDescription('');
        setImageUri('');
        setErrors({});
      } else {
        Alert.alert('Submission Error', result.error || 'Failed to post donation.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An unexpected error occurred while posting donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Donate Surplus Food" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Role Notice */}
        {role === 'receiver' && (
          <View style={styles.roleBanner}>
            <Ionicons name="information-circle" size={20} color={colors.statusAccepted} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.roleBannerTitle}>You are currently in Receiver Mode</Text>
              <Text style={styles.roleBannerText}>
                You can still post a food donation, or switch to Donor mode for full donor profile features.
              </Text>
              <Pressable onPress={() => switchRole('donor')} style={styles.switchRoleInlineBtn}>
                <Text style={styles.switchRoleInlineText}>Switch to Donor Mode</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Image Upload Box */}
        <View style={styles.imageSection}>
          <Text style={styles.inputLabel}>Food Photo</Text>
          {imageUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <Pressable onPress={() => setImageUri('')} style={styles.removeImageBtn}>
                <Ionicons name="trash" size={16} color="#ffffff" />
                <Text style={styles.removeImageText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowImageModal(true)}
              style={({ pressed }) => [styles.imagePickerBox, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera" size={26} color={colors.primary} />
              </View>
              <Text style={styles.imagePickerTitle}>Take Photo or Select Image</Text>
              <Text style={styles.imagePickerSub}>
                Tap to open camera, gallery, or select high-res food photo
              </Text>
            </Pressable>
          )}
        </View>

        {/* Basic Food Details */}
        <CustomInput
          label="Food Item Name *"
          value={foodName}
          onChangeText={setFoodName}
          placeholder="e.g. Fresh Vegetable Biryani, Bread Loaves"
          error={errors.foodName}
        />

        {/* Category Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.inputLabel}>Category *</Text>
          <View style={styles.categoryWrap}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quantity and Unit Row */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CustomInput
              label="Quantity *"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g. 25"
              keyboardType="numeric"
              error={errors.quantity}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CustomInput
              label="Unit (boxes, kg, etc.) *"
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g. meal boxes"
            />
          </View>
        </View>

        {/* Dietary Tag */}
        <View style={styles.fieldContainer}>
          <Text style={styles.inputLabel}>Dietary Preference</Text>
          <View style={styles.categoryWrap}>
            {['Vegetarian', 'Vegan', 'Non-Vegetarian'].map((d) => (
              <Pressable
                key={d}
                onPress={() => setDietary(d)}
                style={[
                  styles.categoryChip,
                  dietary === d && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    dietary === d && styles.categoryChipTextSelected,
                  ]}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Description */}
        <CustomInput
          label="Food Description & Packaging"
          value={description}
          onChangeText={setDescription}
          placeholder="Mention preparation hygiene, temperature, allergens (if any)..."
          multiline
          numberOfLines={3}
        />

        {/* Timings */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CustomInput
              label="Prepared Time"
              value={preparedAt}
              onChangeText={setPreparedAt}
              placeholder="Today, 1:00 PM"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CustomInput
              label="Pickup Deadline *"
              value={pickupDeadline}
              onChangeText={setPickupDeadline}
              placeholder="Today, 8:00 PM"
              error={errors.pickupDeadline}
            />
          </View>
        </View>

        {/* Location & Contact */}
        <CustomInput
          label="Pickup Address *"
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="Restaurant / Business address"
          error={errors.pickupAddress}
        />

        <CustomInput
          label="Donor Contact Phone *"
          value={donorPhone}
          onChangeText={setDonorPhone}
          keyboardType="phone-pad"
          placeholder="+91 98765 43210"
          error={errors.donorPhone}
        />

        {/* Submit Button */}
        <CustomButton
          title="Publish Food Donation"
          onPress={handleSubmit}
          loading={isSubmitting}
          size="large"
          icon={<Ionicons name="cloud-upload" size={18} color="#ffffff" />}
          style={{ marginTop: 10, marginBottom: 20 }}
        />
      </ScrollView>

      {/* Image Selection Modal */}
      <Modal visible={showImageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Food Photo</Text>
              <Pressable onPress={() => setShowImageModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Pressable onPress={handleTakePhoto} style={styles.modalOption}>
              <Ionicons name="camera" size={22} color={colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo with Camera</Text>
            </Pressable>

            <Pressable onPress={handlePickGallery} style={styles.modalOption}>
              <Ionicons name="images" size={22} color={colors.primary} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </Pressable>

            <Text style={styles.modalSectionLabel}>Or Pick from Presets (Demo)</Text>
            <View style={styles.presetGrid}>
              {PRESET_IMAGES.map((preset) => (
                <Pressable
                  key={preset.label}
                  onPress={() => handleSelectPreset(preset.url)}
                  style={styles.presetItem}
                >
                  <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                  <Text style={styles.presetText}>{preset.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={36} color="#ffffff" />
            </View>
            <Text style={styles.successTitle}>Donation Published!</Text>
            <Text style={styles.successMessage}>
              Your surplus food has been listed. Nearby NGOs and community volunteers will be notified for pickup.
            </Text>
            <CustomButton
              title="View on Home Screen"
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('Home');
              }}
              size="medium"
              style={{ width: '100%', marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  roleBanner: {
    flexDirection: 'row',
    backgroundColor: colors.statusAcceptedBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.statusAccepted,
  },
  roleBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.statusAccepted,
  },
  roleBannerText: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  switchRoleInlineBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  switchRoleInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    textDecorationLine: 'underline',
  },
  imageSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  imagePickerBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  imagePickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  imagePickerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  previewContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSubtle,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetItem: {
    width: '47%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetThumb: {
    width: '100%',
    height: 70,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    padding: 4,
    textAlign: 'center',
    backgroundColor: colors.surfaceSubtle,
    color: colors.textPrimary,
  },
  successModalCard: {
    backgroundColor: colors.surface,
    margin: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  successMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default DonateScreen;
