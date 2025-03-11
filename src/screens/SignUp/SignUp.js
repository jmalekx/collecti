import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import commonStyles from '../../commonStyles';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';

const SignUp = ({ navigation }) => {
    const toast = useToast();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;
    
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        return password.length >= 6; 
    };

    const signUp = async () => {
        if (!username.trim()) {
            toast.show("Please enter a username", {type: "warning"});
            return;
        }

        if (!validateEmail(email)) {
            toast.show("Invalid email format", {type: "warning"});
            return;
        }

        if (!validatePassword(password)) {
            toast.show("Password must be at least 6 characters long", {type: "warning"});
            return;
        }

        if (password !== confirmPassword) {
            toast.show("Passwords don't match", {type: "warning"});
            return;
        }
    
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const user = response.user;
            const defaultPfp = 'https://i.pinimg.com/736x/9c/8b/20/9c8b201fbac282d91c766e250d0e3bc6.jpg';
            const defaultThumbnail = 'https://i.pinimg.com/736x/f6/51/5a/f6515a3403f175ed9a0df4625daaaffd.jpg';
        
            // Init profile with isNewUser flag
            const userRef = doc(FIREBASE_DB, 'users', user.uid);
            await setDoc(userRef, {
                username: username.trim(), // Use the username from input field
                email: user.email,
                profilePicture: defaultPfp,
                bio: '',
                createdAt: new Date(),
                collections: 1,
                posts: 0,
                isNewUser: true // This ensures user goes to onboarding
            });
        
            // Create 'Unsorted' collection
            const unsortedCollectionRef = doc(FIREBASE_DB, 'users', user.uid, 'collections', 'Unsorted');
            await setDoc(unsortedCollectionRef, {
                name: 'Unsorted',
                description: 'Posts not yet assigned to a collection',
                createdAt: new Date().toISOString(),
                items: [],
                thumbnail: defaultThumbnail,
                isPinned: true,
            });
        
            toast.show("Sign up successful", {type: "success"});
            navigation.navigate('Screen1');
        } catch (error) {
            console.log(error);
            toast.show("Sign up failed", {type: "danger"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView behavior='padding'>
                <AppTextInput 
                    value={username} 
                    style={styles.input} 
                    placeholder="Username" 
                    autoCapitalize="none"
                    onChangeText={setUsername}
                />
                <AppTextInput 
                    value={email} 
                    style={styles.input} 
                    placeholder="Email" 
                    autoCapitalize="none" 
                    onChangeText={setEmail}
                />
                <AppTextInput 
                    secureTextEntry={true} 
                    value={password} 
                    style={styles.input} 
                    placeholder="Password" 
                    autoCapitalize="none" 
                    onChangeText={setPassword}
                />
                <AppTextInput 
                    secureTextEntry={true} 
                    value={confirmPassword} 
                    style={styles.input} 
                    placeholder="Confirm Password" 
                    autoCapitalize="none" 
                    onChangeText={setConfirmPassword}
                />
            
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff"/>
                ) : (
                    <>
                    <AppButton
                    style={styles.button}
                    title='Sign Up'
                    onPress={signUp}
                    />
           
                    <AppButton
                    style={styles.button}
                    onPress={() => navigation.navigate('SignIn')}
                    title='Already have an account? Sign In'
                    />
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    ...commonStyles,
    root:{
        flex:1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF3E2',
    },
    input: {
        backgroundColor: 'white',
        width: 300,
        height: 50,
        borderColor: '#e8e8e8',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
})

export default SignUp;