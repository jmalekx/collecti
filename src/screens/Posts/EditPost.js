import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../../FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

const EditPost = ({ route, navigation }) => {
    const { collectionId, postId } = route.params;
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const toast = useToast();
    const userId = getAuth().currentUser?.uid;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId);
                const postDoc = await getDoc(postRef);

                if (postDoc.exists()) {
                    const data = postDoc.data();
                    setNotes(data.notes || '');
                    setTags(data.tags?.join(', ') || '');
                } else {
                    toast.show("Post not found", { type: "danger" });
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                toast.show("Failed to load post", { type: "danger" });
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId, collectionId]);

    const handleSave = async () => {
        try {
            const postRef = doc(FIREBASE_DB, 'users', userId, 'collections', collectionId, 'posts', postId);

            await updateDoc(postRef, {
                notes: notes,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                updatedAt: new Date().toISOString(),
            });

            toast.show("Post updated successfully!", { type: "success" });

            // Simply go back instead of explicitly navigating
            navigation.goBack();

        } catch (error) {
            console.error('Error updating post:', error);
            toast.show("Failed to update post", { type: "error" });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave}>
                    <MaterialIcons name="check" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholder="Add notes about this post..."
                />

                <Text style={styles.label}>Tags</Text>
                <TextInput
                    style={styles.input}
                    value={tags}
                    onChangeText={setTags}
                    placeholder="Add tags (comma separated)"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    form: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
});

export default EditPost;