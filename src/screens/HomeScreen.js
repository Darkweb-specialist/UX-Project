import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import SummaryCard from '../components/SummaryCard';
import CategoryPill from '../components/CategoryPill';
import DonationCard from '../components/DonationCard';
import SwipeableCard from '../components/SwipeableCard';
import { useApp } from '../context/AppContext';
import { FOOD_CATEGORIES } from '../storage/sampleData';

export const HomeScreen = ({ navigation }) => {
  const {
    role,
    profile,
    donations,
    pickups,
    userLocation,
    isRefreshing,
    refreshData,
    inspirationTip,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Requested'

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      // Status filter
      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      // Search query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.foodName?.toLowerCase().includes(query) ||
        item.pickupAddress?.toLowerCase().includes(query) ||
        item.donorName?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [donations, selectedCategory, statusFilter, searchQuery]);

  // Metrics for summary
  const availableCount = donations.filter((d) => d.status === 'Available').length;
  const pickupsCompleted = pickups.filter((p) => p.status === 'Picked Up').length;
  const activeRequests = pickups.filter((p) => p.status === 'Requested').length;

  const renderItem = ({ item, index }) => (
    <SwipeableCard
      quickActionLabel="Details"
      quickActionIcon="eye"
      onQuickAction={() => navigation.navigate('DonationDetails', { donationId: item.id })}
    >
      <DonationCard
        item={item}
        index={index}
        userLocation={userLocation}
        onPress={() => navigation.navigate('DonationDetails', { donationId: item.id })}
      />
    </SwipeableCard>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header
        subtitle={`Welcome, ${profile?.name || 'Food Hero'}`}
      />

      <FlatList
        data={filteredDonations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Impact Summary Card */}
            <SummaryCard
              availableCount={availableCount}
              pickupsCompleted={pickupsCompleted}
              activeRequests={activeRequests}
            />

            {/* Public API Inspiration Banner (Requirement 7) */}
            {inspirationTip && (
              <View style={styles.tipBanner}>
                <Ionicons name="bulb-outline" size={18} color={colors.primaryDark} style={styles.tipIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Zero Hunger Initiative</Text>
                  <Text style={styles.tipText}>{inspirationTip.tip}</Text>
                  <Text style={styles.tipSource}>Source: {inspirationTip.source}</Text>
                </View>
              </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search food, location, or donor..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Category Filter Pills */}
            <CategoryPill
              categories={FOOD_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Status Filter Tabs */}
            <View style={styles.statusTabs}>
              {['All', 'Available', 'Requested'].map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setStatusFilter(tab)}
                  style={[
                    styles.statusTabButton,
                    statusFilter === tab && styles.statusTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTabText,
                      statusFilter === tab && styles.statusTabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {statusFilter === 'All' ? 'Surplus Food Listings' : `${statusFilter} Donations`}
              </Text>
              <Text style={styles.countBadge}>
                {filteredDonations.length} {filteredDonations.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="fast-food-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Donations Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No donations match "${searchQuery}". Try clearing your search.`
                : 'There are currently no donations in this category.'}
            </Text>
            {searchQuery ? (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setStatusFilter('All');
                }}
                style={styles.resetFilterBtn}
              >
                <Text style={styles.resetFilterBtnText}>Reset All Filters</Text>
              </Pressable>
            ) : role === 'donor' ? (
              <Pressable
                onPress={() => navigation.navigate('Donate')}
                style={styles.resetFilterBtn}
              >
                <Text style={styles.resetFilterBtnText}>Post a Food Donation</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 30,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryFaint,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  tipSource: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
  },
  statusTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
    gap: 8,
  },
  statusTabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTabActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusTabTextActive: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetFilterBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default HomeScreen;
