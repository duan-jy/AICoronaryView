<template>
  <el-select
    ref="plaqueSelect"
    :class="{
      'inline-select': true,
      'is-multiple-empty': selectValue.length === 0
    }"
    v-model="selectValue"
    :multiple="true"
    :clearable="false"
    size="mini"
    :fit-input-width="false"
    placeholder="斑块性质"
    popper-class="common-options"
    @change="selectChange"
  >
    <el-checkbox-group v-model="selectValue">
      <el-option
        v-for="item in plaqueOptions"
        :key="item.value"
        :value="item.label"
        :label="item.label"
      >
        <el-checkbox style="pointer-events: none" :label="item.label" />
      </el-option>
    </el-checkbox-group>
  </el-select>
</template>

<script>
import { plaqueObj, plaqueOptions } from '@/utils/source'
export default {
  props: {
    plaque: {
      type: Object,
      default: () => {
        return {
          Calcification: false,
          Mixed: false,
          NonCalcification: false
        }
      }
    }
  },
  data() {
    return {
      selectValue: []
    }
  },
  mounted() {
    this.selectValue = []
    for (const item of plaqueOptions) {
      if (this.plaque[item.alias]) {
        this.selectValue.push(item.label)
      }
    }
  },
  setup() {
    return {
      plaqueObj,
      plaqueOptions
    }
  },
  methods: {
    selectChange(value) {
      const selectVal = {}
      for (const item of plaqueOptions) {
        const status = value.indexOf(item.label) !== -1
        selectVal[item.alias] = status
      }
      const timer = setTimeout(() => {
        this.$refs.plaqueSelect.blur()
        clearTimeout(timer)
      }, 100)
      this.$emit('plaqueChange', selectVal)
    }
  }
}
</script>
