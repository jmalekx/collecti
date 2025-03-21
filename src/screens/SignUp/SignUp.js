import React, { useState, useLayoutEffect } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from 'react-native-toast-notifications';
import commonStyles from '../../commonStyles';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';
import { showToast, TOAST_TYPES } from '../../components/Toasts';

const SignUp = ({ navigation }) => {
    const toast = useToast();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: 'Create Account',
        headerTitleStyle: {
            fontFamily: 'Inter_700Bold',
            fontSize: 18,
        },
        headerStyle: {
            backgroundColor: '#F9F6F2', //change color later
            shadowColor: 'transparent',
            shadowOffset: { height: 0, width: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
            borderBottomWidth: 0,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
    });
}, [navigation]);
    
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        return password.length >= 6; 
    };

    const signUp = async () => {
        if (!username.trim()) {
            showToast(toast,"Please enter a username", {type: TOAST_TYPES.WARNING});
            return;
        }

        if (!validateEmail(email)) {
            showToast(toast,"Invalid email format", {type: TOAST_TYPES.WARNING});
            return;
        }

        if (!validatePassword(password)) {
            showToast(toast,"Password must be at least 6 characters long", {type: TOAST_TYPES.WARNING});
            return;
        }

        if (password !== confirmPassword) {
            showToast(toast,"Passwords don't match", {type: TOAST_TYPES.WARNING});
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
        
            showToast(toast,"Sign up successful", {type: TOAST_TYPES.SUCCESS});
            navigation.navigate('Screen1');
        } catch (error) {
            console.log(error);
            showToast(toast,"Sign up failed", {type: TOAST_TYPES.DANGER});
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
           
                    <View style={styles.signContainer}>
                        <AppText>Already have an account? </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                            <AppText style={styles.signLink}>Sign In</AppText>
                        </TouchableOpacity>
                    </View>
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
    },
})

export default SignUp;