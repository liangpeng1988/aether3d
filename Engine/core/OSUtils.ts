/**
 * 操作系统和浏览器检测工具
 * 提供各种平台和浏览器的检测功能
 */

const os = {
    /**
     * 检测是否为iPhone上的Safari浏览器
     * @returns {boolean} 如果是iPhone上的Safari浏览器则返回true，否则返回false
     */
    isIphoneSafari(): boolean {
        // 检查是否在浏览器环境中运行
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        const userAgent = window.navigator.userAgent;
        const isIphone = /iPhone/i.test(userAgent);
        const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);

        return isIphone && isSafari;
    },

    /**
     * 检测是否为Android设备
     * @returns {boolean} 如果是Android设备则返回true，否则返回false
     */
    isAndroid(): boolean {
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        return /Android/i.test(window.navigator.userAgent);
    },

    /**
     * 检测是否为iOS设备
     * @returns {boolean} 如果是iOS设备则返回true，否则返回false
     */
    isIOS(): boolean {
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
    },

    /**
     * 检测是否为移动设备
     * @returns {boolean} 如果是移动设备则返回true，否则返回false
     */
    isMobile(): boolean {
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        return this.isIOS() || this.isAndroid();
    },

    /**
     * 检测是否为桌面设备
     * @returns {boolean} 如果是桌面设备则返回true，否则返回false
     */
    isDesktop(): boolean {
        return !this.isMobile();
    },

    /**
     * 获取操作系统名称
     * @returns {string} 操作系统名称
     */
    getOSName(): string {
        if (typeof window === 'undefined' || !window.navigator) {
            return 'unknown';
        }

        const userAgent = window.navigator.userAgent;

        if (this.isIOS()) {
            return 'iOS';
        } else if (this.isAndroid()) {
            return 'Android';
        } else if (/Windows/i.test(userAgent)) {
            return 'Windows';
        } else if (/Mac/i.test(userAgent)) {
            return 'MacOS';
        } else if (/Linux/i.test(userAgent)) {
            return 'Linux';
        }

        return 'unknown';
    },

    /**
     * 检测是否为Safari浏览器
     * @returns {boolean} 如果是Safari浏览器则返回true，否则返回false
     */
    isSafari(): boolean {
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        const userAgent = window.navigator.userAgent;
        return /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    },

    /**
     * 检测是否为Chrome浏览器
     * @returns {boolean} 如果是Chrome浏览器则返回true，否则返回false
     */
    isChrome(): boolean {
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        return /Chrome/i.test(window.navigator.userAgent);
    },

    /**
     * 检测是否为Firefox浏览器
     * @returns {boolean} 如果是Firefox浏览器则返回true，否则返回false
     */
    isFirefox(): boolean {
        if (typeof window === 'undefined' || !window.navigator) {
            return false;
        }

        return /Firefox/i.test(window.navigator.userAgent);
    }
};

export { os };
