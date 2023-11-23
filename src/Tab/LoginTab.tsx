import React, {useEffect} from 'react';
import {CallApi, HomeContainer, NotoSansKR, RowContainer} from '../Component';
import {styled} from 'styled-components/native';
import {TouchableOpacity} from 'react-native';
import {useMutation} from 'react-query';
import {setUser} from '../../store/slice/UserSlice';
import {
  loadUser,
  persistUser,
  userDataType,
} from '../../store/async/asyncStore';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {KakaoOAuthToken, login} from '@react-native-seoul/kakao-login';

const signInWithKakao = async (): Promise<void> => {
  try {
    const token: KakaoOAuthToken = await login();
    console.log(token);

    // setResult(JSON.stringify(token));
  } catch (err) {
    console.log(err);
  }
};

const guestLogin = () =>
  CallApi({endpoint: 'user/create/guest', method: 'POST'});

const LoginTab = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const bootstrapAsync = async () => {
      const userData = await loadUser();
      if (userData) {
        dispatch(setUser(userData));
        navigation.navigate('MainTab' as never);
      }
    };

    bootstrapAsync();
  }, [dispatch, navigation]);

  const {
    mutate: login_guest,
    isLoading,
    error,
  } = useMutation(guestLogin, {
    onSuccess: response => {
      // 요청 성공 시 수행할 작업
      const userData: userDataType = {
        UID: response.UID,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        userName: 'Guest',
      };

      dispatch(setUser(userData));
      persistUser(userData);
      console.log('Success:', userData);
      navigation.navigate('MainTab' as never);
    },
    onError: () => {
      // 요청 실패 시 수행할 작업
      console.error('Error:', error);
    },
  });

  return (
    <HomeContainer>
      <BackgroundImage source={require('../../assets/image/background.png')} />
      <LoginContainer>
        <Title source={require('../../assets/image/title.png')} />

        <LoginButton kakao onPress={() => signInWithKakao()}>
          <RowContainer gap={8}>
            <IconImage
              source={require('../../assets/image/kakao_icon.png')}
              size={24}
            />
            <NotoSansKR size={14} style={{flex: 1, textAlign: 'center'}}>
              카카오톡으로 시작하기
            </NotoSansKR>
          </RowContainer>
        </LoginButton>

        <LoginButton>
          <RowContainer gap={8}>
            <IconImage
              source={require('../../assets/image/apple_icon.png')}
              size={20}
            />
            <NotoSansKR size={14} style={{flex: 1, textAlign: 'center'}}>
              애플로 시작하기
            </NotoSansKR>
          </RowContainer>
        </LoginButton>

        <TouchableOpacity
          onPress={() => {
            if (isLoading) {
              console.log('Guest login is already in progress.');
              return;
            } else {
              login_guest();
            }
          }}>
          <NotoSansKR
            size={14}
            weight="Medium"
            color="white"
            style={{
              textDecorationLine: 'underline',
              textAlign: 'center',
            }}>
            게스트 계정으로 시작하기
          </NotoSansKR>
        </TouchableOpacity>
      </LoginContainer>
    </HomeContainer>
  );
};

const BackgroundImage = styled.ImageBackground`
  position: absolute;
  width: 100%;
  height: 100%;
  resize: contain;
  flex: 1;
  bottom: 0;
`;

const LoginContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  padding: 32px;
  gap: 6px;
`;

const Title = styled.Image`
  margin-bottom: 4px;
`;
const IconImage = styled.Image<{size: number}>`
  width: ${({size}) => `${size}px`};
  height: ${({size}) => `${size}px`};
`;

const LoginButton = styled.TouchableOpacity<{kakao?: boolean}>`
  margin-top: 6px;
  width: 193px;
  background-color: ${({kakao}) => (kakao ? '#fddc3f' : '#fff')};
  padding: 8px 16px 8px 12px;
  border-radius: 5px;
`;

export default LoginTab;