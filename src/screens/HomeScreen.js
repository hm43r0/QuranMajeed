import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useTheme } from "../ThemeContext";
import paraData from "../data/paraData.json";
import bookmarkData from "../data/bookmarkData.json";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("para");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [pageQuery, setPageQuery] = useState("");
  const [surahData, setSurahData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ["para", "surah", "bookmark"];
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  // Fetch surah data from API
  useEffect(() => {
    const fetchSurahData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahData(data.data);
        } else {
          setError('Failed to fetch surah data');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching surah data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahData();
  }, []);

  const getCurrentData = () => {
    switch (activeTab) {
      case "para":
        return paraData;
      case "surah":
        return surahData;
      case "bookmark":
        return bookmarkData;
      default:
        return paraData;
    }
  };

  // helper: find para (juz) number for a given page by matching nearest lower-or-equal page
  const findParaForPage = (page) => {
    if (!paraData || !Array.isArray(paraData)) return null;
    // assume paraData entries are sorted by page asc
    let para = null;
    for (let i = 0; i < paraData.length; i++) {
      const p = paraData[i];
      if (page >= p.page) {
        para = p;
      } else {
        break;
      }
    }
    return para ? para.id : null;
  };

  const switchToTab = (index) => {
    if (index >= 0 && index < tabs.length) {
      setCurrentTabIndex(index);
      setActiveTab(tabs[index]);
    }
  };

  const onGestureEvent = (event) => {
    // Store the translation for later use
    const { translationX } = event.nativeEvent;
    // You can add visual feedback here if needed
  };

  const onHandlerStateChange = (event) => {
    const { translationX, state } = event.nativeEvent;

    if (state === State.END) {
      const swipeThreshold = 50; // Minimum distance for swipe

      if (translationX > swipeThreshold) {
        // Swipe right - go to previous tab
        switchToTab(currentTabIndex - 1);
      } else if (translationX < -swipeThreshold) {
        // Swipe left - go to next tab
        switchToTab(currentTabIndex + 1);
      }
    }
  };

  const renderItem = ({ item }) => {
    const isBookmark = activeTab === "bookmark";
    const isSurah = activeTab === "surah";
    const paraId = isBookmark ? findParaForPage(item.page) : null;
    
    let labelText = "";
    let arabicText = "";
    let badgeText = "";
    
    if (isBookmark) {
      labelText = `Page: ${item.page}${paraId ? ` , Para: ${paraId}` : ""}`;
      arabicText = item.arabic;
      badgeText = item.id;
    } else if (isSurah) {
      labelText = `${item.englishName} (${item.englishNameTranslation})`;
      arabicText = item.name;
      badgeText = item.number;
    } else {
      labelText = `Page No : ${item.page}`;
      arabicText = item.arabic;
      badgeText = item.id;
    }

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}> 
        {/* Left: book icon + play button */}
        <View style={styles.leftIconsRow}>
          <TouchableOpacity
            style={[styles.bookIconWrap, { backgroundColor: theme.iconBackground }]}
          >
            <MaterialIcons name="menu-book" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Middle: centered page pill / label */}
        <View style={styles.centerPillWrap}>
          <View style={[styles.pagePill, { backgroundColor: theme.pageLabelBackground, borderColor: theme.primary }]}> 
            <Text style={[styles.pagePillText, { color: theme.primary }]}>{labelText}</Text>
          </View>
        </View>

        {/* Right: Arabic text */}
        <View style={styles.rightWrapper}> 
          <View style={styles.rightColumn}>
            <Text style={[styles.arabic, { color: theme.arabicText }]} numberOfLines={1} ellipsizeMode="tail">
              {arabicText}
            </Text>
          </View>
        </View>

        {/* Number badge */}
        <View style={[styles.badgePill, styles.badgeRight, { backgroundColor: '#f6b100' }]}> 
          <Text style={[styles.badgeText, { color: theme.textLight }]}>{badgeText}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.menuButton,
            { backgroundColor: theme.cardBackground, marginRight: 12 },
          ]}
          onPress={() => navigation.openDrawer()}
        >
          <MaterialIcons name="menu" size={20} color={theme.textDark} />
        </TouchableOpacity>

        <View>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>
            Quran Majeed
          </Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
            Read & Explore
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.searchButton,
            { backgroundColor: theme.cardBackground, marginLeft: 12 },
          ]}
          onPress={() => setShowSearchInput((s) => !s)}
        >
          <MaterialIcons name="search" size={20} color={theme.textDark} />
        </TouchableOpacity>
      </View>

      {/* Search modal popup */}
      <Modal
        visible={showSearchInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchInput(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setShowSearchInput(false);
          }}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[
                  styles.modalCard,
                  { backgroundColor: theme.cardBackground },
                ]}
              >
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Go to Page
                </Text>
                <TextInput
                  value={pageQuery}
                  onChangeText={setPageQuery}
                  placeholder="Enter page number"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  style={[styles.modalInput, { color: theme.textDark }]}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancel,
                      { borderColor: theme.textSecondary },
                    ]}
                    onPress={() => setShowSearchInput(false)}
                  >
                    <Text
                      style={[
                        styles.modalCancelText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalGo, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      console.log("Go to page", pageQuery);
                      setShowSearchInput(false);
                    }}
                  >
                    <Text
                      style={[styles.modalGoText, { color: theme.textLight }]}
                    >
                      Go
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]} // Only activate for horizontal movement
        failOffsetY={[-20, 20]} // Fail if vertical movement exceeds this
      >
        <View style={{ flex: 1 }}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "para" && styles.activeTab,
                {
                  backgroundColor:
                    activeTab === "para" ? theme.primary : theme.iconBackground,
                },
              ]}
              onPress={() => {
                setActiveTab("para");
                setCurrentTabIndex(0);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "para" ? theme.textLight : theme.textDark,
                  },
                ]}
              >
                Para
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "surah" && styles.activeTab,
                {
                  backgroundColor:
                    activeTab === "surah"
                      ? theme.primary
                      : theme.iconBackground,
                },
              ]}
              onPress={() => {
                setActiveTab("surah");
                setCurrentTabIndex(1);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "surah" ? theme.textLight : theme.textDark,
                  },
                ]}
              >
                Surah
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "bookmark" && styles.activeTab,
                {
                  backgroundColor:
                    activeTab === "bookmark"
                      ? theme.primary
                      : theme.iconBackground,
                },
              ]}
              onPress={() => {
                setActiveTab("bookmark");
                setCurrentTabIndex(2);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "bookmark"
                        ? theme.textLight
                        : theme.textDark,
                  },
                ]}
              >
                Bookmark
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={getCurrentData()}
            keyExtractor={(item) => (item.id || item.number).toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={
              activeTab === "surah" && loading ? (
                <View style={styles.centerContainer}>
                  <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
                    Loading Surah data...
                  </Text>
                </View>
              ) : activeTab === "surah" && error ? (
                <View style={styles.centerContainer}>
                  <Text style={[styles.errorText, { color: theme.textPrimary }]}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setError(null);
                      // Re-fetch data
                      const fetchSurahData = async () => {
                        setLoading(true);
                        try {
                          const response = await fetch('https://api.alquran.cloud/v1/surah');
                          const data = await response.json();
                          if (data.code === 200) {
                            setSurahData(data.data);
                          } else {
                            setError('Failed to fetch surah data');
                          }
                        } catch (err) {
                          setError('Network error occurred');
                        } finally {
                          setLoading(false);
                        }
                      };
                      fetchSurahData();
                    }}
                  >
                    <Text style={[styles.retryButtonText, { color: theme.textLight }]}>
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        </View>
      </PanGestureHandler>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f6f2" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: { fontSize: 22, fontWeight: "700", color: "#1b5e20" },
  appSubtitle: { fontSize: 12, color: "#556b2f", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  menuButton: {
    backgroundColor: "#f7f9f6",
    padding: 8,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    marginLeft: 8,
  },
  themeButton: {
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  themeButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  searchButton: {
    backgroundColor: "#f7f9f6",
    padding: 8,
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  tab: {
    backgroundColor: "#e9f5ec",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#2e7d32" },
  tabText: { color: "#0b2e13", fontWeight: "600", fontSize: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fbfdfb",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  leftIconsRow: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  bookIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    elevation: 2,
  },
  middle: { flex: 1 },
  centerPillWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  pagePill: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#fbfff9',
    borderColor: '#e1e9e1',
  },
  pagePillText: { fontWeight: "800", fontSize: 14 },
  rightWrapper: {
    flex: 0.6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 36, // reserve space inside the card for the pill
  },
  rightColumn: { alignItems: "flex-end", paddingRight: 8 },
  arabic: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: "right",
    writingDirection: "rtl",
    marginBottom: 0,
    fontFamily: "Amiri",
    color: "#27422a",
  },
  badgePill: {
    backgroundColor: "#f5c86a",
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 12,
    // bottom kept default; will adjust with badgeRight for vertical centering
    elevation: 2,
  },
  badgeRight: {
    top: '50%',
    transform: [{ translateY: -18 }],
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  bookmarkLabel: {
    borderWidth: 1,
    borderColor: "#cfcfcf",
    color: "#2b2b2b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignSelf: "center",
    backgroundColor: "#fbfbfb",
    fontWeight: "600",
  },
  bookmarkRibbon: {
    right: 6,
    top: 12,
    bottom: "auto",
    height: 44,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchLabel: { fontSize: 14, fontWeight: "600", marginRight: 8 },
  searchInputWrap: { flex: 1, marginRight: 8 },
  searchInput: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  goButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  goButtonText: { fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 12,
    padding: 18,
    elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: {
    backgroundColor: "#fafcf9",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end" },
  modalCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  modalCancelText: { fontWeight: "600" },
  modalGo: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  modalGoText: { fontWeight: "700" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
