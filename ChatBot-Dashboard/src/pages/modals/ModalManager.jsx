import {homeModal} from "./HomeModal.jsx";
import {settingsModal} from "./SettingsModal";
import {profileModal} from "./ProfileModal";

const MODAL_COMPONENTS={
    home: homeModal,
    settings: settingsModal,
    profile: profileModal,
}

export function ModalManager({ activeModal, onClose}){
    const modalComponent=MODAL_COMPONENTS[activeModal];
    if(!modalComponent) return null;
    return <modalComponent isOpen={true} onClose={onClose}/>;
}