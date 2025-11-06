import { THREE } from "../core/global";
import { MaterialConfig } from "./MaterialConfig";
import { BeforeMaterial } from "./BeforeMaterial";

export interface IMaterialFactory {
    createMaterial(config: MaterialConfig): THREE.Material;
    applyConfig(material: THREE.Material, config: MaterialConfig): void;
}

export class StandardMaterialFactory implements IMaterialFactory {
    createMaterial(config: MaterialConfig): THREE.Material {
        switch (config.type) {
            case 'diffusion':
                return this.createDiffusionMaterial(config);
            case 'basic':
                return this.createBasicMaterial(config);
            case 'lambert':
                return this.createLambertMaterial(config);
            case 'phong':
                return this.createPhongMaterial(config);
            case 'standard':
            default:
                return this.createStandardMaterial(config);
        }
    }

    private createStandardMaterial(config: MaterialConfig): THREE.MeshStandardMaterial {
        return new THREE.MeshStandardMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            map: config.texture,
            alphaMap: config.alphaMap,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    private createBasicMaterial(config: MaterialConfig): THREE.MeshBasicMaterial {
        return new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            map: config.texture,
            alphaMap: config.alphaMap,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    private createLambertMaterial(config: MaterialConfig): THREE.MeshLambertMaterial {
        return new THREE.MeshLambertMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            map: config.texture,
            alphaMap: config.alphaMap,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    private createPhongMaterial(config: MaterialConfig): THREE.MeshPhongMaterial {
        return new THREE.MeshPhongMaterial({
            color: config.color,
            transparent: config.transparent,
            opacity: config.opacity,
            map: config.texture,
            alphaMap: config.alphaMap,
            side: config.doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });
    }

    private createDiffusionMaterial(config: MaterialConfig): BeforeMaterial {
        return new BeforeMaterial({
            color: config.color,
            highlightColor: config.highlightColor,
            transparent: config.transparent,
            opacity: config.opacity,
            speed: config.speed,
            radius: config.radius,
            width: config.width
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
