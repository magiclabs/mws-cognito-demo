import { useEffect, useState } from "react";
import { Magic } from "magic-sdk";
import { OpenIdExtension } from "@magic-ext/oidc";
import PulseLoader from "react-spinners/PulseLoader";
import { ethers } from "ethers";

const MagicWidget = ({ user, signOut }) => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const magicPublishableKey = "pk_live_E4F135AEC08C0BEB";
  const providerId = "iADLL3f93drBVBQpvwiAWnnBwfrFY4vR_IE5Z7Ob3Uc=";
  const jwt = user.signInUserSession.idToken.jwtToken;

  const magic = new Magic(magicPublishableKey, {
    network: "goerli",
    extensions: [new OpenIdExtension()],
  });

  const provider = new ethers.BrowserProvider(magic.rpcProvider);

  const loginWithMagic = async () => {
    setLoading(true);

    await magic.openid.loginWithOIDC({ jwt, providerId });
    const data = await magic.user.getMetadata();

    setAddress(data.publicAddress);
    setLoading(false);
  };

  const getBalance = async () => {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (isLoggedIn) {
      const weiBalance = await provider.getBalance(address);
      const ethBalance = ethers.formatEther(weiBalance);
      setBalance(ethBalance);
    }
  };

  const logout = async () => {
    await magic.user.logout();
    signOut();
  };

  useEffect(() => {
    loginWithMagic();
  }, []);

  useEffect(() => {
    if (address) {
      getBalance();
    }
  }, [address]);

  return (
    <div>
      {!address || !balance ? (
        <PulseLoader color="#6851ff" />
      ) : (
        <div>
          <p>{address}</p>
          <p>{balance}</p>
          <button onClick={logout}>Sign Out</button>
        </div>
      )}
    </div>
  );
};

export default MagicWidget;
