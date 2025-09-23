import { THREE } from "../core/global";
import { MaterialConfig } from "./MaterialConfig";

export interface IMaterialFactory {
    createMaterial(config: MaterialConfig): THREE.Material;
    applyConfig(material: THREE.Material, config: MaterialConfig): void;
}

export class StandardMaterialFactory implements IMaterialFactory {
    createMaterial(config: MaterialConfig): THREE.Material {
        return new THREE.MeshStandardMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            map: config.texture,
            alphaMap: config.alphaMap,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    applyConfig(material: THREE.Material, config: MaterialConfig): void {
        if (config.transparent) {
            material.transparent = config.transparent;
        }
        if (config.opacity != null) {
            material.opacity = config.opacity;
        }
        material.side = config.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
    }
}
