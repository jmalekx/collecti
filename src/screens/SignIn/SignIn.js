// React and React Native core imports
import React, { useState } from 'react';
import { View, Image, StyleSheet, useWindowDimensions, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity } from 'react-native';

// Third-party library external imports
import { useToast } from 'react-native-toast-notifications';

// Project services and utilities
import { signIn } from '../../services/auth';
import { showToast, TOAST_TYPES } from '../../components/Toasts';
import formValidation from '../../utils/formValidation';

// Custom component imports and styling
import Logo from '../../images/tmplogo.png';
import commonStyles from '../../styles/commonStyles';
import { AppText, AppHeading, AppButton, AppTextInput } from '../../components/Typography';

/*
    SignIn Screem

    Implements user auth interfacte following MVC architecture pattern. Handles view aspect,
    delegating data manipulato to auth layer.
    
*/

const SignIn = ({ navigation }) => {

    //Content managing
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //State transitions
    const [loading, setLoading] = useState(false);

    //Context states
    const toast = useToast();
    const { height } = useWindowDimensions();

    //Function to handle sign in
    const handleSignIn = async () => {
        //Form validation
        if (!formValidation.validateSignInForm({ email, password }, toast)) {
            return;
        }

        setLoading(true);
        try {
            //Auth service
            const user = await signIn(email, password);

            //Clear on success
            setEmail('');
            setPassword('');

            showToast(toast, "Login successful", { type: TOAST_TYPES.SUCCESS });
        }
        catch (error) {
            showToast(toast, "Login failed", { type: TOAST_TYPES.DANGER });
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <commonStyles.Bg>
            <View style={styles.root}>

                {/* Logo */}
                <Image
                    source={Logo}
                    style={[styles.logo, { height: height * 0.45 }]}
                    resizeMode='contain'
                    accessibilityLabel="Application logo"
                />

                {/* Header text */}
                <View style={styles.headerContainer}>
                    <AppHeading style={styles.headerText}>Welcome</AppHeading>
                    <AppText style={styles.subHeaderText}>Please enter your details below</AppText>
                </View>

                {/* Form */}
                <KeyboardAvoidingView behavior='padding' style={styles.formContainer}>

                    {/* Email */}
                    <AppTextInput
                        value={email}
                        style={styles.input}
                        placeholder="Email"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        accessibilityLabel="Email input"
                        testID="email-input"
                    />

                    {/* Password */}
                    <AppTextInput
                        secureTextEntry={true}
                        value={password}
                        style={styles.input}
                        placeholder="Password"
                        autoCapitalize="none"
                        onChangeText={setPassword}
                        accessibilityLabel="Password input"
                        testID="password-input"
                    />

                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color="#0000ff"
                            accessibilityLabel="Loading indicator"
                        />
                    ) : (
                        <>
                            {/* Login button */}
                            <AppButton
                                style={styles.button}
                                title="Login"
                                onPress={handleSignIn}
                                accessibilityLabel="Login button"
                                testID="login-button"
                            />

                            {/* Sign up link */}
                            <View style={styles.signContainer}>
                                <AppText>Don't have an account? </AppText>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('SignUp')}
                                    accessibilityLabel="Sign up link"
                                    testID="signup-link"
                                >
                                    <AppText style={styles.signLink}>Sign Up</AppText>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </KeyboardAvoidingView>
            </View>
        </commonStyles.Bg>
    );
};


const styles = StyleSheet.create({
    ...commonStyles,
    root: {
        flex: 1,
        alignItems: 'center',
    },
    logo: {
        width: '75%',
        maxWidth: 200,
    },
    MainText: {
        alignSelf: 'flex-start',
        marginLeft: 35,
    },
})

export default SignIn;