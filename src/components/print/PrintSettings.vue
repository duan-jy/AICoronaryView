<script setup lang="ts">
interface PrintSettingsModel {
  service: 'Printer' | 'Push'
  printer: string
  size: string
  scope: 'all' | 'current'
}

const model = defineModel<PrintSettingsModel>({ required: true })

const printerOptions = ['Printer', 'DICOM Printer 1', 'DICOM Printer 2']
const sizeOptions = [
  { value: '14INX17IN', label: '14INX17IN' },
  { value: '11INX14IN', label: '11INX14IN' },
  { value: '10INX12IN', label: '10INX12IN' },
  { value: '8INX10IN', label: '8INX10IN' }
]
</script>

<template>
  <div class="print-settings">
    <!-- Service Type -->
    <div class="setting-row">
      <label class="setting-label">推送服务:</label>
      <div class="setting-control">
        <label class="radio-label">
          <input 
            type="radio" 
            value="Printer" 
            v-model="model.service"
          />
          <span>Printer</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            value="Push" 
            v-model="model.service"
          />
          <span>推送</span>
        </label>
        <div class="toggle-group">
          <span class="toggle-label">打印</span>
          <label class="toggle">
            <input type="checkbox" checked />
            <span class="toggle-slider" />
          </label>
        </div>
      </div>
    </div>

    <!-- Printer Selection -->
    <div class="setting-row">
      <label class="setting-label">打印机:</label>
      <div class="setting-control">
        <select v-model="model.printer" class="select-input">
          <option v-for="opt in printerOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <label class="setting-label inline">尺寸:</label>
        <select v-model="model.size" class="select-input">
          <option v-for="opt in sizeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Print Scope -->
    <div class="setting-row">
      <label class="setting-label">打印范围:</label>
      <div class="setting-control">
        <label class="radio-label">
          <input 
            type="radio" 
            value="all" 
            v-model="model.scope"
          />
          <span>全部</span>
        </label>
        <label class="radio-label">
          <input 
            type="radio" 
            value="current" 
            v-model="model.scope"
          />
          <span>当前页</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.print-settings {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.setting-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.setting-label {
  width: 70px;
  flex-shrink: 0;
  color: var(--text-secondary);
  font-size: 13px;
  
  &.inline {
    width: auto;
    margin-left: 12px;
    margin-right: 8px;
  }
}

.setting-control {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  
  input {
    accent-color: var(--primary-color);
  }
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  
  .toggle-label {
    color: var(--text-secondary);
    font-size: 13px;
  }
}

.toggle {
  position: relative;
  width: 40px;
  height: 20px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + .toggle-slider {
      background: var(--primary-color);
      
      &::before {
        transform: translateX(20px);
      }
    }
  }
  
  .toggle-slider {
    position: absolute;
    inset: 0;
    background: var(--bg-secondary);
    border-radius: 10px;
    cursor: pointer;
    transition: 0.2s;
    
    &::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      left: 2px;
      top: 2px;
      background: white;
      border-radius: 50%;
      transition: 0.2s;
    }
  }
}

.select-input {
  height: 28px;
  padding: 0 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
}
</style>
