<script setup lang="ts">
interface PushService {
  id: number
  name: string
  aet: string
  selected: boolean
}

interface Props {
  services: PushService[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [serviceId: number]
}>()

const toggleService = (serviceId: number) => {
  emit('toggle', serviceId)
}
</script>

<template>
  <div class="push-service-list">
    <div class="list-header">
      <h3 class="list-title">推送服务列表</h3>
    </div>

    <div class="list-table">
      <div class="table-header">
        <div class="col col-checkbox"></div>
        <div class="col col-id">序号</div>
        <div class="col col-name">名称</div>
        <div class="col col-aet">AET</div>
      </div>

      <div class="table-body">
        <div
          v-for="service in services"
          :key="service.id"
          class="table-row"
          :class="{ selected: service.selected }"
          @click="toggleService(service.id)"
        >
          <div class="col col-checkbox">
            <label class="checkbox">
              <input 
                type="checkbox" 
                :checked="service.selected"
                @click.stop
                @change="toggleService(service.id)"
              />
              <span class="checkmark" />
            </label>
          </div>
          <div class="col col-id">{{ service.id }}</div>
          <div class="col col-name">{{ service.name }}</div>
          <div class="col col-aet">{{ service.aet }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.push-service-list {
  border-top: 1px solid var(--border-color);
}

.list-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  
  .list-title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-color);
  }
}

.list-table {
  font-size: 13px;
}

.table-header {
  display: flex;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  
  .col {
    padding: 4px 8px;
  }
}

.table-body {
  max-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }
}

.table-row {
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: var(--bg-secondary);
  }
  
  &.selected {
    background: rgba(var(--primary-rgb), 0.1);
  }
  
  .col {
    padding: 4px 8px;
  }
}

.col {
  &-checkbox {
    width: 40px;
    flex-shrink: 0;
  }
  
  &-id {
    width: 60px;
    flex-shrink: 0;
  }
  
  &-name {
    flex: 1;
  }
  
  &-aet {
    flex: 1;
  }
}

.checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  
  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    
    &:checked + .checkmark {
      background: var(--primary-color);
      border-color: var(--primary-color);
      
      &::after {
        display: block;
      }
    }
  }
  
  .checkmark {
    width: 16px;
    height: 16px;
    border: 1px solid var(--border-color);
    border-radius: 2px;
    background: transparent;
    transition: all 0.2s;
    
    &::after {
      content: '';
      display: none;
      position: absolute;
      left: 6px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}
</style>
