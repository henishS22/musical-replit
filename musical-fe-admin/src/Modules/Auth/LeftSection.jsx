import { useStyles } from "./Login/LoginStyles";
import AdminLogo from "../../Assets/Svg/logo-light.svg";
import LoginBg from "../../Assets/Images/background_signin.webp";

const LeftSection = () => {
const classes = useStyles();
    return (
      <div className={classes.leftImageSection}>
        <img src={LoginBg} alt="Login Visual" className={classes.leftImage} />
        <div className={classes.leftOverlay}>
          <img src={AdminLogo} alt="Logo" className={classes.leftOverlayLogo} />
          <div className={classes.leftOverlayTitle}>Admin Platform</div>
          {/* <div className={classes.leftOverlaySubtitle}>
              PLAY (MUSIC) TO EARN
            </div> */}
          <div className={classes.leftOverlayDesc}>
            Join our collaborative platform that is built for creators, by
            creators, to foster economic empowerment and unlock musical talent
            across the globe.
          </div>
        </div>
      </div>
    );

}

export default LeftSection