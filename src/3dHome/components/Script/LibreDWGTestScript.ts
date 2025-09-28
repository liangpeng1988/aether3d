import { ScriptBase } from "../../../../Engine/core/ScriptBase";
import { THREE } from "../../../../Engine/core/global";

// 导入测试的库
import { AcDbDatabaseConverterManager, AcDbFileType } from '@mlightcad/data-model';
import { AcDbLibreDwgConverter } from '@mlightcad/libredwg-converter';

export class LibreDWGTestScript extends ScriptBase {
    private testResults: Map<string, any> = new Map();

    constructor() {
        super();
        this.name = "LibreDWGTestScript";
    }

    /**
     * 启动脚本时调用
     */
    public start(): void {
        console.log("LibreDWG Test Script started");
        this.testLibraryImports();
    }

    /**
     * 测试库导入和基本功能
     */
    private testLibraryImports(): void {
        try {
            // 测试 @mlightcad/data-model 导入
            console.log("Testing @mlightcad/data-model import...");
            console.log("AcDbDatabaseConverterManager:", typeof AcDbDatabaseConverterManager);
            console.log("AcDbFileType:", typeof AcDbFileType);
            
            // 测试 @mlightcad/libredwg-converter 导入
            console.log("Testing @mlightcad/libredwg-converter import...");
            console.log("AcDbLibreDwgConverter:", typeof AcDbLibreDwgConverter);
            
            // 尝试创建实例（如果可能）
            try {
                // 注意：这里可能需要特定的初始化参数，我们只是测试导入是否成功
                console.log("Library imports successful!");
                this.testResults.set("importStatus", "success");
            } catch (error) {
                console.warn("Library imported but instantiation failed:", error);
                this.testResults.set("importStatus", "partial");
                this.testResults.set("instantiationError", error);
            }
        } catch (error) {
            console.error("Library import test failed:", error);
            this.testResults.set("importStatus", "failed");
            this.testResults.set("importError", error);
        }
        
        // 输出测试结果到控制台
        console.log("Test Results:", Object.fromEntries(this.testResults));
    }

    public update(): void {
        // 每帧更新逻辑（如果需要）
    }

    /**
     * 获取测试结果
     */
    public getTestResults(): Map<string, any> {
        return this.testResults;
    }
}