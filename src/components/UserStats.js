//React and React Native core imports
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';

//Third-party library external imports
import { Ionicons } from '@expo/vector-icons';

//Custom component imports and stylingy
import { colours } from '../styles/commonStyles';

/*
    UserStats Component

    Implements data visualisation for user profile statistics.
    Metrics displayed in responsive card-based layout
    Component handles:"
    - Calculating time-based engagement metrics from user metadata (join date)
    - Computing content metrics from collections and posts data
    - Rendering responsive visualisation cards with icons and labels
*/

const UserStats = ({ user, collections }) => {
    //Local state for calculated metrics
    const [daysSinceCreation, setDaysSinceCreation] = useState(0);
    const [collectionsCount, setCollectionsCount] = useState(0);
    const [postsCount, setPostsCount] = useState(0);

    //Calculate all metrics when props change
    useEffect(() => {
        //Calculate days since account creation
        if (user && user.metadata && user.metadata.creationTime) {
            const creationDate = new Date(user.metadata.creationTime);
            const today = new Date();
            const diffTime = Math.abs(today - creationDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysSinceCreation(diffDays);
        }

        //Update collections count
        setCollectionsCount(collections?.length || 0);

        //Calculate total posts across all collections
        const total = collections?.reduce((sum, collection) =>
            sum + (collection.items?.length || 0), 0) || 0;
        setPostsCount(total);
    }, [user, collections]);

    return (
        <View style={styles.statsCollage}>

            {/* Days Collecting Card - Largest */}
            <View style={[styles.statsCard, styles.statsCardLarge, { backgroundColor: colours.primary }]}>
                <Text style={[styles.statsLabel, styles.statsLabelLarge]}>Collecting days</Text>
                <View style={styles.statsDetails}>
                    <View style={styles.iconContainerLarge}>
                        <Ionicons name="calendar-outline" size={34} color={colours.buttonsTextPink} />
                    </View>
                    <Text style={[styles.statsNumber, styles.statsNumberLarge]}>{daysSinceCreation}</Text>
                </View>
            </View>

            <View style={styles.statsColumn}>
                {/* Collections Card */}
                <View style={[styles.statsCard, styles.statsCardSmall, { backgroundColor: colours.buttons }]}>
                    <Text style={styles.statsLabel}>Collections</Text>
                    <View style={styles.statsDetails}>
                        <View style={styles.iconContainerSmall}>
                            <Ionicons name="folder-outline" size={18} color={colours.buttonsText} />
                        </View>
                        <Text style={styles.statsNumber}>{collectionsCount}</Text>
                    </View>
                </View>

                {/* Posts Card */}
                <View style={[styles.statsCard, styles.statsCardSmall, { backgroundColor: '#F8F9FA' }]}>
                    <Text style={styles.statsLabel}>Posts</Text>
                    <View style={styles.statsDetails}>
                        <View style={[styles.iconContainerSmall, { backgroundColor: '#E2E2E2' }]}>
                            <Ionicons name="images-outline" size={18} color="#9E9E9E" />
                        </View>
                        <Text style={styles.statsNumber}>{postsCount}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    // ...existing styles
    statsCollage: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        height: 180,
        gap: 12,
    },
    statsColumn: {
        width: '48%',
        justifyContent: 'space-between',
        height: '100%',
        gap: 12,
    },
    statsCard: {
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 4,
        justifyContent: 'space-between',
    },
    statsCardLarge: {
        width: '48%',
        height: '100%',
        padding: 18,
    },
    statsCardSmall: {
        height: '48%',
        padding: 12,
    },
    statsDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: -1,
    },
    statsNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'right',
        marginRight: 8,
    },
    statsNumberLarge: {
        fontSize: 38,
        marginRight: -1,
    },
    statsLabel: {
        fontSize: 20,
        fontWeight: '600',
        color: '#555',
        marginBottom: 2,
        textAlign: 'left',
    },
    statsLabelLarge: {
        fontSize: 25,
        marginBottom: 6,
    },
    iconContainerLarge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
    },
    iconContainerSmall: {
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 2,
    },
});

export default UserStats;