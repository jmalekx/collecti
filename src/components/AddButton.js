import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Button, StyleSheet } from 'react-native';

const AddButton = ({ onAddPost, onAddCollection }) => {
    const [isFabMenuVisible, setIsFabMenuVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [newCollectionName, setNewCollectionName] = useState('');
  
    const handleAddPost = () => {
      onAddPost(notes, tags); // Pass the entered notes and tags to the parent
      setIsModalVisible(false);
      setNotes('');
      setTags('');
      setIsFabMenuVisible(false); // Hide the FAB menu after adding post
    };
  
    const handleAddCollection = () => {
      if (!newCollectionName.trim()) {
        alert('Collection name cannot be empty!');
        return;
      }
      onAddCollection(newCollectionName); // Pass the collection name to the parent
      setIsAddCollectionModalVisible(false);
      setNewCollectionName('');
      setIsFabMenuVisible(false); // Hide the FAB menu after adding collection
    };
  
    return (
      <View>
        {/* Add New Collection Modal */}
        {isAddCollectionModalVisible && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={isAddCollectionModalVisible}
            onRequestClose={() => setIsAddCollectionModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add New Collection</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Collection Name"
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                />
                <Button title="Create Collection" onPress={handleAddCollection} />
                <Button title="Cancel" onPress={() => setIsAddCollectionModalVisible(false)} />
              </View>
            </View>
          </Modal>
        )}
  
        {/* Quick Add / Detailed Add Modal */}
        {isModalVisible && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add to Collection</Text>
  
                <TextInput
                  placeholder="Enter Notes"
                  value={notes}
                  onChangeText={setNotes}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Enter Tags (comma separated)"
                  value={tags}
                  onChangeText={setTags}
                  style={styles.input}
                />
  
                <Button title="Quick Add" onPress={handleAddPost} />
                <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
              </View>
            </View>
          </Modal>
        )}
  
        {/* FAB Button */}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setIsFabMenuVisible(!isFabMenuVisible)} // Toggle FAB menu visibility
        >
          <Text style={styles.fabButtonText}>+</Text>
        </TouchableOpacity>
  
        {/* FAB Menu Options */}
        {isFabMenuVisible && (
          <View style={styles.fabMenu}>
            <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setIsModalVisible(true); setIsFabMenuVisible(false); }}>
              <Text style={styles.fabMenuText}>Add New Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setIsAddCollectionModalVisible(true); setIsFabMenuVisible(false); }}>
              <Text style={styles.fabMenuText}>Add New Collection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };  

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  fabMenu: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 200,
    padding: 10,
  },
  fabMenuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fabMenuText: {
    fontSize: 16,
    color: '#007bff',
  },
});

export default AddButton;