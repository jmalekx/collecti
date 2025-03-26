//React and React Native core imports
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

//Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

//Custom component imports and styling
import { showToast, TOAST_TYPES } from './Toasts';
import commonStyles from '../commonStyles';

/*
    PostForm Component

    Implements reusable form interface for post creation and editing.
    Implements form validation, state mnagement and data transformatuoion
*/

const PostForm = ({ initialNotes = '', initialTags = '', initialCollectionId = '',
    collections, onSubmit, submitButtonText = 'Save Changes',}) => {
    
    //Content managing
    const [notes, setNotes] = React.useState(initialNotes);
    const [tags, setTags] = React.useState(initialTags);

    //State transitions
    const [selectedCollectionId, setSelectedCollectionId] = React.useState(initialCollectionId);
    
    //Context states
    const toast = useToast();

    //Form submission handler
    const handleSubmit = () => {
        //Input validations
        if (!notes.trim()) {
            showToast(toast, "Notes cannot be empty", { type: TOAST_TYPES.WARNING });
            return;
        }

        //Data transform and submit (comma-sepparated string to clean array)
        onSubmit({
            notes,
            tags: tags.split(',').map(tag => tag.trim()),
            collectionId: selectedCollectionId
        });
    };

    return (
        <View style={styles.container}>
            {/* Notes Field - Required */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter post notes"
                multiline
            />

            {/* Tags Field - Optional */}          
            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
                style={styles.input}
                value={tags}
                onChangeText={setTags}
                placeholder="e.g., travel, inspiration"
            />

            {/* Collection Selector - Required with default */}
            <Text style={styles.label}>Collection</Text>
            <Picker
                selectedValue={selectedCollectionId}
                onValueChange={(itemValue) => setSelectedCollectionId(itemValue)}
                style={styles.picker}
            >
                {collections.map(collection => (
                    <Picker.Item
                        key={collection.id}
                        label={collection.name}
                        value={collection.id}
                    />
                ))}
            </Picker>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>{submitButtonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    ...commonStyles,
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PostForm;