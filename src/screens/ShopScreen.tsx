import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { products } from "../data/products";
import { Product } from "../types";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  "All",
  "Laptops & PCs",
  "Chargers & Power",
  "Hubs & Adapters",
  "Stands",
  "Storage",
  "Phones & Tablets",
  "Audio & Sound",
  "Smartwatches",
  "Peripherals",
];

export function ShopScreen() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specs.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAdd = async (product: Product) => {
    await addToCart(product);
    setAddedToast(`Added "${product.name.split(" ")[0]}..." to cart!`);
    setTimeout(() => {
      setAddedToast(null);
    }, 2000);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.productDetails}>
        <Text style={styles.categoryTag}>{item.category}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productSpecs} numberOfLines={1}>
          {item.specs}
        </Text>

        {/* Pricing */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            ₦{item.price.toLocaleString("en-NG")}
          </Text>
          <Text style={styles.originalPriceText}>
            ₦{item.originalPrice.toLocaleString("en-NG")}
          </Text>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAdd(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Toast Feedback */}
      {addedToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✅ {addedToast}</Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search gadgets, accessories..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearIcon}>✖️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Category Chips */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(cat) => cat}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        renderItem={renderProductItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for something else or pick a different category.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  toast: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "#282828",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#FFFFFF",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#282828",
    padding: 0,
  },
  clearIcon: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  categoryContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDEDED",
    paddingBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryChipActive: {
    backgroundColor: "#F68B1E",
    borderColor: "#F68B1E",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  productList: {
    padding: 10,
    paddingBottom: 80,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 125,
    backgroundColor: "#EDF2F7",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#E53E3E",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  productDetails: {
    padding: 10,
  },
  categoryTag: {
    fontSize: 10,
    color: "#718096",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#282828",
    marginTop: 2,
    height: 32,
    lineHeight: 16,
  },
  productSpecs: {
    fontSize: 10,
    color: "#A0AEC0",
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#F68B1E",
  },
  originalPriceText: {
    fontSize: 10,
    color: "#A0AEC0",
    textDecorationLine: "line-through",
  },
  addButton: {
    backgroundColor: "#F68B1E",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#282828",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 30,
  },
});
