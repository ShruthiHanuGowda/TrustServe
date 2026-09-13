import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

import BlurView from '../BlurView';
// import { BlurView } from '@react-native-community/blur';

import { useMutation } from '@apollo/client';

import {
  VERIFY_OTP,
  RESEND_OTP,
} from '../../graphql/queries';

import { DButton } from '../index';

import styles from './styles';


// ============================================================
// THEME
// ============================================================

const PRIMARY_COLOR = '#009D94';
const INACTIVE_COLOR = '#000000';


// ============================================================
// OTP RESULT
// ============================================================

export type OTPResult = {
  success: boolean;
  message?: string;
  isExistingUser?: boolean;
  user?: any;
};


// ============================================================
// PROPS
// ============================================================

type OTPModalProps = {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onVerified: (result: OTPResult) => void;
};


// ============================================================
// COMPONENT
// ============================================================

export default function OTPModal({
  visible,
  phoneNumber,
  onClose,
  onVerified,
}: OTPModalProps) {

  const [otp, setOtp] =
    useState('');

  const [error, setError] =
    useState('');

  const [resending, setResending] =
    useState(false);

  const inputRef =
    useRef<TextInput>(null);


  // ==========================================================
  // VERIFY
  // ==========================================================

  const [
    verifyOTP,
    {
      loading: verifying,
    },
  ] = useMutation(VERIFY_OTP);


  // ==========================================================
  // RESEND
  // ==========================================================

  const [
    resendOTP,
  ] = useMutation(RESEND_OTP);


  // ==========================================================
  // OPEN MODAL
  // ==========================================================

  useEffect(() => {

    if (!visible) {
      return;
    }

    setOtp('');
    setError('');

    const timer =
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);

    return () => {
      clearTimeout(timer);
    };

  }, [visible]);


  // ==========================================================
  // OTP CHANGE
  // ==========================================================

  const handleOtpChange =
    (value: string) => {

      const numericValue =
        value
          .replace(/[^0-9]/g, '')
          .slice(0, 6);

      setOtp(numericValue);

      if (error) {
        setError('');
      }
    };


  // ==========================================================
  // BUTTON STATE
  // ==========================================================

  const isVerifyEnabled =
    otp.length === 6 &&
    !verifying &&
    !resending;

  const verifyButtonBackgroundColor =
    isVerifyEnabled
      ? PRIMARY_COLOR
      : INACTIVE_COLOR;


  // ==========================================================
  // VERIFY
  // ==========================================================

  const handleVerify =
    async () => {

      if (otp.length !== 6) {

        setError(
          'Enter the 6-digit code.',
        );

        return;
      }

      if (
        verifying ||
        resending
      ) {
        return;
      }

      try {

        setError('');

        console.log(
          '======================================',
        );

        console.log(
          'VERIFY OTP',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        console.log(
          'OTP:',
          otp,
        );

        console.log(
          '======================================',
        );

        const {
          data,
        } =
          await verifyOTP({
            variables: {
              phoneNumber,
              otp,
            },
          });

        const result =
          data?.verifyOTP;

        console.log(
          'VERIFY RESULT:',
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        if (!result?.success) {

          setError(
            result?.message ||
            'Invalid code. Please try again.',
          );

          setOtp('');

          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);

          return;
        }

        onVerified(result);

      } catch (err) {

        console.error(
          'OTP verification error:',
          err,
        );

        setError(
          'Unable to verify the code. Please try again.',
        );
      }
    };


  // ==========================================================
  // RESEND
  // ==========================================================

  const handleResend =
    async () => {

      if (
        resending ||
        verifying
      ) {
        return;
      }

      if (!phoneNumber) {

        setError(
          'Phone number is missing.',
        );

        return;
      }

      try {

        setResending(true);

        setError('');

        setOtp('');

        console.log(
          '======================================',
        );

        console.log(
          'RESEND OTP',
        );

        console.log(
          'PHONE:',
          phoneNumber,
        );

        console.log(
          '======================================',
        );

        const {
          data,
        } =
          await resendOTP({
            variables: {
              phoneNumber,
            },
          });

        const result =
          data?.resendOTP;

        console.log(
          'RESEND RESULT:',
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        if (!result?.success) {

          setError(
            result?.message ||
            'Unable to resend the code.',
          );

          return;
        }

        setOtp('');
        setError('');

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);

      } catch (err) {

        console.error(
          'Resend OTP error:',
          err,
        );

        setError(
          'Unable to resend the code. Please try again.',
        );

      } finally {

        setResending(false);

      }
    };


  // ==========================================================
  // HIDDEN
  // ==========================================================

  if (!visible) {
    return null;
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >

      <BlurView
        style={styles.blur}
        blurType="light"
        blurAmount={16}
        reducedTransparencyFallbackColor="rgba(255,255,255,0.94)"
      />

      <View style={styles.overlay}>

        <Pressable
          style={styles.outside}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <View style={styles.card}>

            {/* ==================================================
                CLOSE
            ================================================== */}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              disabled={
                verifying ||
                resending
              }
            >

              <Text style={styles.closeText}>
                ×
              </Text>

            </TouchableOpacity>


            {/* ==================================================
                ICON
            ================================================== */}

            {/* <View style={styles.iconContainer}>

              <Text style={styles.icon}>
                ✓
              </Text>

            </View> */}


            {/* ==================================================
                TITLE
            ================================================== */}

            <Text style={styles.title}>
              Verify number
            </Text>


            <Text style={styles.subtitle}>
              Enter the code sent to
            </Text>


            <Text style={styles.phone}>
              {phoneNumber}
            </Text>


            {/* ==================================================
                OTP
            ================================================== */}

            <View style={styles.otpWrapper}>

              <View style={styles.otpBoxes}>

                {Array
                  .from({ length: 6 })
                  .map((_, index) => {

                    const digit =
                      otp[index];

                    const isActive =
                      index === otp.length;

                    return (

                      <View
                        key={index}
                        style={[
                          styles.otpBox,

                          isActive &&
                          styles.otpBoxActive,

                          error &&
                          styles.otpBoxError,
                        ]}
                      >

                        <Text
                          style={
                            styles.otpDigit
                          }
                        >
                          {digit || ''}
                        </Text>

                      </View>
                    );
                  })}

              </View>


              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={
                  handleOtpChange
                }
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                caretHidden
                selectionColor="transparent"
                style={
                  styles.hiddenInput
                }
                editable={
                  !verifying &&
                  !resending
                }
              />

            </View>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error ? (

              <Text style={styles.error}>
                {error}
              </Text>

            ) : null}


            {/* ==================================================
                VERIFY BUTTON
            ================================================== */}

            <DButton
              type="primary"
              style={[
                styles.verifyButton,
                {
                  backgroundColor:
                    verifyButtonBackgroundColor,
                },
              ]}
              disabled={
                !isVerifyEnabled
              }
              onPress={
                handleVerify
              }
            >

              <View
                style={
                  styles.verifyButtonContent
                }
              >

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {verifying
                    ? 'Verifying...'
                    : 'Verify & Continue'}
                </Text>

              </View>

            </DButton>


            {/* ==================================================
                RESEND
            ================================================== */}

            <View
              style={
                styles.resendContainer
              }
            >

              <Text
                style={
                  styles.resendText
                }
              >
                Didn't receive the code?
              </Text>


              <TouchableOpacity
                onPress={
                  handleResend
                }
                disabled={
                  resending ||
                  verifying
                }
                activeOpacity={0.7}
              >

                <Text
                  style={
                    styles.resendLink
                  }
                >
                  {resending
                    ? 'Resending...'
                    : 'Resend'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </KeyboardAvoidingView>

      </View>

    </Modal>
  );
}