<template>
  <div>
    <div
      v-if="!isMobile"
      class="fixed left-0 top-0 h-screen w-20 flex flex-col z-40 shadow-sm"
    >

      <div class="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'stickers' }"
            @click="toggleMenu('stickers')"
          >
            <Sticker class="w-6 h-6" :class="activeMenu === 'stickers' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'stickers'">
            Stickers
          </q-tooltip>

          <div
            v-if="activeMenu === 'stickers'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Stickers</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4">
              <toolbar-sticker-picker @select="handleStickerSelect" />
            </div>
          </div>
        </div>

        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'emoji' }"
            @click="toggleMenu('emoji')"
          >
            <Smile class="w-6 h-6" :class="activeMenu === 'emoji' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'emoji'">
            Elements
          </q-tooltip>

          <div
            v-if="activeMenu === 'emoji'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">Elements</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4 emoji-picker-wrapper">
              <ClientOnly>
                <EmojiPicker v-if="EmojiPicker" :native="true" @select="handleEmojiSelect" />
                <div v-else class="flex items-center justify-center h-full text-gray-500">Loading...</div>
              </ClientOnly>
            </div>
          </div>
        </div>

        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'background' }"
            @click="toggleMenu('background')"
          >
            <Palette class="w-6 h-6" :class="activeMenu === 'background' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'background'">
            Background
          </q-tooltip>

          <div
            v-if="activeMenu === 'background'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Background</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <BackgroundPicker />
            </div>
          </div>
        </div>

        <!-- Monogram Button -->
        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'monogram' }"
            @click="toggleMenu('monogram')"
          >
            <q-icon name="mdi-alpha-m-circle" size="24px" :class="activeMenu === 'monogram' ? 'text-purple-600' : 'text-gray-600'" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'monogram'">
            Monogram
          </q-tooltip>

          <div
            v-if="activeMenu === 'monogram'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Create Monogram</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <SidebarMonogramPicker
                :editing-element="editingMonogramElement"
                @add="handleMonogramAdd"
                @update="handleMonogramUpdate"
                @cancel="closeMenu"
              />
            </div>
          </div>
        </div>


        <div class="relative sidebar-item">
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'layers' }"
            @click="toggleMenu('layers')"
          >
            <Layers class="w-6 h-6" :class="activeMenu === 'layers' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'layers'">
            Layers
          </q-tooltip>

          <div
            v-if="activeMenu === 'layers'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Layers</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <LayerPanel @layer-update="handleLayerUpdate" />
            </div>
          </div>
        </div>

        <div class="relative sidebar-item">
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'text' || textToolActive }"
            @click="toggleTextMenu"
          >
            <Type class="w-6 h-6" :class="(activeMenu === 'text' || textToolActive) ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'text'">
            Text
          </q-tooltip>

          <div
            v-if="activeMenu === 'text'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Text</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto  p-6">
              <div class="space-y-4">
                <!-- Add Text Button -->
                <button
                  class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center text-center"
                  @click="handleAddText"
                >
                  <Type class="w-8 h-8 text-gray-400 mb-2" :stroke-width="2" />
                  <div class="font-medium text-gray-900 mb-1">Add Text</div>
                  <div class="text-sm text-gray-500">Click canvas to add text box</div>
                </button>

                <div class="border-t border-gray-200 my-4"></div>

                <!-- Advanced Options -->
                <div class="space-y-3">
                  <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Advanced Options</h4>
                  
                  <!-- Monogram button removed - now has its own dedicated sidebar button -->
                </div>

                <div class="border-t border-gray-200 my-4"></div>

                <!-- Enhanced Font Picker -->
                <div class="enhanced-font-section">
                  <div class="font-section-header">
                    <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Typography</h4>
                  </div>
                  <EnhancedFontPicker
                    :selected-font="selectedFont"
                    :font-size="fontSize"
                    :text-color="textColor"
                    :is-bold="isBold"
                    :is-italic="isItalic"
                    :is-underline="isUnderline"
                    :letter-spacing="letterSpacing"
                    :line-height="lineHeight"
                    preview-text="Aa"
                    @font-change="handleFontChange"
                    @font-size-change="handleFontSizeChange"
                    @color-change="handleColorChange"
                    @bold-change="toggleBold"
                    @italic-change="toggleItalic"
                    @underline-change="toggleUnderline"
                    @letter-spacing-change="handleLetterSpacingChange"
                    @line-height-change="handleLineHeightChange"
                  />
                </div>

              </div>
            </div>
          </div>
                    </div>
                    
        <div class="relative sidebar-item">
                      <button
            class="w-full h-14 rounded-xl flex items-center justify-center transition-all duration-200"
            :class="activeMenu === 'draw' ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-100 text-gray-700'"
            @click="toggleMenu('draw')"
          >
            <PenTool class="w-6 h-6" :class="activeMenu === 'draw' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
                      </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'draw'">
            Draw
          </q-tooltip>

          <div
            v-if="activeMenu === 'draw'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Draw Tool</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
                      </button>
                    </div>
            <div class="flex-1 overflow-y-auto px-4 py-4">
              <div class="space-y-6">
                <div class="text-sm text-gray-600 mb-4">Customize your drawing tool:</div>
                
                <div class="space-y-4">
                  <div class="section-header">
                    <q-icon name="mdi-brush" size="16px" class="section-icon" />
                    <span class="section-title">Brush Size</span>
                    </div>
                  <div class="brush-size-grid">
                      <button
                      v-for="size in brushSizes"
                      :key="size.value"
                      class="size-option"
                      :class="{ active: currentBrushSize === size.value }"
                      @click="updateBrushSize(size.value)"
                      :title="size.label"
                    >
                      <div class="size-indicator" :class="`size-${size.value}`"></div>
                      <span class="size-label">{{ size.label }}</span>
                      </button>
                    </div>
                  </div>

                <div class="toolbar-divider"></div>

                <div class="space-y-4">
                  <div class="section-header">
                    <q-icon name="mdi-palette" size="16px" class="section-icon" />
                    <span class="section-title">Color</span>
                    </div>
                  <div class="color-section">
                    <div class="color-presets">
                      <button
                        v-for="color in colorPresets"
                        :key="color"
                        class="color-preset"
                        :class="{ active: currentBrushColor === color }"
                        :style="{ backgroundColor: color }"
                        @click="updateBrushColor(color)"
                        :title="color"
                      />
                    </div>
                    <div class="custom-color-wrapper">
                      <input
                        type="color"
                        :value="currentBrushColor"
                        @input="updateBrushColor($event.target.value)"
                        class="custom-color-picker"
                        title="Custom color"
                      />
                      <span class="custom-color-label">Custom</span>
                      </div>
                    </div>
                  </div>

                <div class="toolbar-divider"></div>

                <div class="action-buttons">
                  <button class="modern-btn clear-btn" @click="clearDrawing" title="Clear drawing">
                    <q-icon name="mdi-delete-outline" size="16px" />
                    <span>Clear</span>
                  </button>
                  <button class="modern-btn done-btn" @click="finishDrawing" title="Finish drawing">
                    <q-icon name="mdi-check" size="16px" />
                    <span>Done</span>
                  </button>
                    </div>
              </div>
            </div>
          </div>
        </div>

        <button
          class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-all duration-200"
          @click="fileInputRef?.pickFiles()"
        >
          <Upload class="w-6 h-6 text-gray-600" :stroke-width="2" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Upload
          </q-tooltip>
        </button>
      </div>

      <div class="px-2 pb-6">
        <div class="h-px bg-gray-200 mb-4"></div>

        <button
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          @click="handleCheckout"
        >
          <ShoppingCart class="w-5 h-5" :stroke-width="2.5" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Done
          </q-tooltip>
        </button>
      </div>
    </div>

    <div 
      v-else
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-lg"
    >
      <div class="flex items-center justify-around px-2 py-3">
        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'stickers' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('stickers')"
        >
          <Sticker class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Stickers</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'emoji' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('emoji')"
        >
          <Smile class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Elements</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'background' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('background')"
        >
          <Palette class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">BG</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'layers' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('layers')"
        >
          <Layers class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Layers</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="(activeMenu === 'text' || textToolActive) ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleTextMenu"
        >
          <Type class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Text</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="drawToolActive ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="activateDrawTool"
        >
          <PenTool class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Draw</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg hover:bg-gray-50 transition-all"
          @click="fileInputRef?.pickFiles()"
        >
          <Upload class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Upload</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white transition-all"
          @click="handleCheckout"
        >
          <ShoppingCart class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-semibold">Done</span>
        </button>
      </div>
    </div>

    <div v-if="isMobile && activeMenu" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" @click="activeMenu = null">
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-auto p-6" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ activeMenu === 'stickers' ? 'Stickers' :
               activeMenu === 'emoji' ? 'Elements' :
               activeMenu === 'background' ? 'Background' :
               activeMenu === 'layers' ? 'Layers' :
               activeMenu === 'text' ? 'Text' : '' }}
          </h3>
          <button @click="activeMenu = null" class="text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-6 h-6" :stroke-width="2" />
          </button>
        </div>

        <toolbar-sticker-picker v-if="activeMenu === 'stickers'" @select="handleStickerSelect" />
        <ClientOnly v-else-if="activeMenu === 'emoji'">
          <EmojiPicker v-if="EmojiPicker" :native="true" @select="handleEmojiSelect" />
          <div v-else class="flex items-center justify-center h-32 text-gray-500">Loading...</div>
        </ClientOnly>
        <BackgroundPicker v-else-if="activeMenu === 'background'" />
        <LayerPanel v-else-if="activeMenu === 'layers'" @layer-update="handleLayerUpdate" />
        
        <div v-else-if="activeMenu === 'text'" class="space-y-4">
          <button
            class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center text-center"
            @click="handleAddText"
          >
            <Type class="w-8 h-8 text-gray-400 mb-2" :stroke-width="2" />
            <div class="font-medium text-gray-900 mb-1">Add Text</div>
            <div class="text-sm text-gray-500">Click canvas to add text box</div>
          </button>

          <div class="border-t border-gray-200 my-4"></div>

          <!-- Advanced Options -->
          <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Advanced Options</h4>
            
            <!-- Monogram button removed - now has its own dedicated sidebar button -->
          </div>

          <div class="border-t border-gray-200 my-4"></div>

          <!-- Text Styling Panel (Mobile) -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-700 uppercase tracking-wide">Text Styling</h4>
            
            <!-- Font Family Section (Mobile) -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <q-icon name="mdi-format-text" size="16px" class="text-gray-600" />
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Font Family</label>
              </div>
              
              <!-- Font Category Tabs -->
              <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  v-for="category in fontCategories"
                  :key="category.value"
                  class="flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200"
                  :class="selectedFontCategory === category.value 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'"
                  @click="selectedFontCategory = category.value"
                >
                  {{ category.label }}
                </button>
              </div>
              
              <!-- Font Search -->
              <q-input
                v-model="fontSearchQuery"
                placeholder="Search fonts..."
                dense
                outlined
                class="text-sm"
              >
                <template #prepend>
                  <q-icon name="search" size="16px" class="text-gray-400" />
                </template>
              </q-input>
              
              <!-- Font Grid -->
              <div class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                <button
                  v-for="font in filteredFonts"
                  :key="font.value"
                  class="p-2 text-left border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                  :class="selectedFont === font.value ? 'border-purple-500 bg-purple-50' : ''"
                  @click="handleFontChange(font.value)"
                >
                  <div class="text-xs font-medium text-gray-900 truncate" :style="{ fontFamily: font.value }">
                    {{ font.label }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Font Size (Mobile) -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <q-icon name="mdi-format-text" size="16px" class="text-gray-600" />
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Font Size</label>
              </div>
              
              <!-- Font Size Slider -->
              <div class="flex items-center gap-2">
                <q-slider
                  v-model="fontSize"
                  :min="12"
                  :max="200"
                  :step="1"
                  color="purple"
                  class="flex-1"
                  @update:model-value="handleFontSizeChange"
                />
                <span class="text-xs text-gray-500 w-8">{{ fontSize }}px</span>
              </div>
              
              <!-- Font Size Presets -->
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="preset in fontSizePresets"
                  :key="preset.label"
                  class="px-2 py-1 text-xs font-medium rounded-md transition-all duration-200"
                  :class="isFontSizePresetActive(preset.value) 
                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                  @click="handleFontSizePreset(preset.value)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- Text Color (Mobile) -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full border border-gray-300" :style="{ backgroundColor: textColor }"></div>
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Text Color</label>
              </div>
              <q-input
                v-model="textColor"
                type="color"
                dense
                outlined
                @update:model-value="handleColorChange"
              >
                <template #prepend>
                  <div class="w-6 h-6 rounded border border-gray-300" :style="{ backgroundColor: textColor }"></div>
                </template>
              </q-input>
            </div>

            <!-- Text Formatting -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Formatting</label>
              <div class="flex gap-2">
                <q-btn
                  :color="isBold ? 'purple' : 'grey-3'"
                  :text-color="isBold ? 'white' : 'black'"
                  size="sm"
                  icon="format_bold"
                  @click="toggleBold"
                />
                <q-btn
                  :color="isItalic ? 'purple' : 'grey-3'"
                  :text-color="isItalic ? 'white' : 'black'"
                  size="sm"
                  icon="format_italic"
                  @click="toggleItalic"
                />
                <q-btn
                  :color="isUnderline ? 'purple' : 'grey-3'"
                  :text-color="isUnderline ? 'white' : 'black'"
                  size="sm"
                  icon="format_underlined"
                  @click="toggleUnderline"
                />
              </div>
            </div>

            <!-- Stroke -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Stroke</label>
                <q-toggle
                  v-model="strokeEnabled"
                  color="purple"
                  size="sm"
                  @update:model-value="toggleStroke"
                />
              </div>
              <div v-if="strokeEnabled" class="space-y-2 pl-4">
                <q-input
                  v-model="strokeColor"
                  type="color"
                  dense
                  outlined
                  size="sm"
                  @update:model-value="handleStrokeColorChange"
                />
                <div class="flex items-center gap-2">
                  <q-slider
                    v-model="strokeWidth"
                    :min="1"
                    :max="10"
                    :step="1"
                    color="purple"
                    class="flex-1"
                    @update:model-value="handleStrokeWidthChange"
                  />
                  <span class="text-xs text-gray-500 w-8">{{ strokeWidth }}px</span>
                </div>
              </div>
            </div>

            <!-- Shadow -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Shadow</label>
                <q-toggle
                  v-model="shadowEnabled"
                  color="purple"
                  size="sm"
                  @update:model-value="toggleShadow"
                />
              </div>
              <div v-if="shadowEnabled" class="space-y-2 pl-4">
                <q-input
                  v-model="shadowColor"
                  type="color"
                  dense
                  outlined
                  size="sm"
                  @update:model-value="handleShadowColorChange"
                />
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-12">Blur:</span>
                    <q-slider
                      v-model="shadowBlur"
                      :min="0"
                      :max="20"
                      :step="1"
                      color="purple"
                      class="flex-1"
                      @update:model-value="handleShadowBlurChange"
                    />
                    <span class="text-xs text-gray-500 w-8">{{ shadowBlur }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-12">X:</span>
                    <q-slider
                      v-model="shadowOffsetX"
                      :min="-20"
                      :max="20"
                      :step="1"
                      color="purple"
                      class="flex-1"
                      @update:model-value="handleShadowOffsetXChange"
                    />
                    <span class="text-xs text-gray-500 w-8">{{ shadowOffsetX }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-12">Y:</span>
                    <q-slider
                      v-model="shadowOffsetY"
                      :min="-20"
                      :max="20"
                      :step="1"
                      color="purple"
                      class="flex-1"
                      @update:model-value="handleShadowOffsetYChange"
                    />
                    <span class="text-xs text-gray-500 w-8">{{ shadowOffsetY }}px</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 w-12">Opacity:</span>
                    <q-slider
                      v-model="shadowOpacity"
                      :min="0"
                      :max="1"
                      :step="0.1"
                      color="purple"
                      class="flex-1"
                      @update:model-value="handleShadowOpacityChange"
                    />
                    <span class="text-xs text-gray-500 w-8">{{ Math.round(shadowOpacity * 100) }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Engrave -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Engrave Effect</label>
                <q-toggle
                  v-model="engraveEnabled"
                  color="purple"
                  size="sm"
                  @update:model-value="toggleEngrave"
                />
              </div>
              <div class="text-xs text-gray-500">
                Creates a knockout effect where text cuts through the background
              </div>
            </div>

            <!-- Letter Spacing -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Letter Spacing</label>
              <div class="flex items-center gap-2">
                <q-slider
                  v-model="letterSpacing"
                  :min="-5"
                  :max="20"
                  :step="0.5"
                  color="purple"
                  class="flex-1"
                  @update:model-value="handleLetterSpacingChange"
                />
                <span class="text-xs text-gray-500 w-12">{{ letterSpacing }}px</span>
              </div>
            </div>

            <!-- Line Height -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Line Height</label>
              <div class="flex items-center gap-2">
                <q-slider
                  v-model="lineHeight"
                  :min="0.5"
                  :max="3"
                  :step="0.1"
                  color="purple"
                  class="flex-1"
                  @update:model-value="handleLineHeightChange"
                />
                <span class="text-xs text-gray-500 w-12">{{ lineHeight }}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-file
      ref="fileInputRef"
      v-model="fileInput"
      style="display: none"
      accept="image/*"
      @update:model-value="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import {
  Sticker,
  Smile,
  Type,
  PenTool,
  Upload,
  ShoppingCart,
  X,
  Palette,
  Layers
} from 'lucide-vue-next';

// Lazy load EmojiPicker only on client-side
let EmojiPicker = null;
if (process.client) {
  EmojiPicker = (await import('vue3-emoji-picker')).default;
  await import('vue3-emoji-picker/css');
}
import ToolbarStickerPicker from '~/components/editor/pickers/StickerPicker.vue';
import BackgroundPicker from '~/components/editor/pickers/BackgroundPicker.vue';
import LayerPanel from '~/components/editor/pickers/LayerPanel.vue';
import EnhancedFontPicker from '~/components/editor/pickers/EnhancedFontPicker.vue';
import SidebarMonogramPicker from '~/components/editor/pickers/SidebarMonogramPicker.vue';
import { useTextEditorStore } from '~/store/textEditor';
import { useEditorStore } from '~/store/editor';
import { useProductStore } from '~/store/product';
import { useDrawToolStore } from '~/store/drawTool';
import { AVAILABLE_FONTS, CUSTOM_MONOGRAM_FONTS } from '~/config/fonts';

const $q = useQuasar();
const textEditorStore = useTextEditorStore();
const editorStore = useEditorStore();
const productStore = useProductStore();
const drawToolStore = useDrawToolStore();

defineProps({
  textToolActive: {
    type: Boolean,
    default: false,
  },
  drawToolActive: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits([
  'upload', 'activate-text-tool', 'activate-draw-tool', 'add-emoji', 'checkout', 'add-image', 
  'open-advanced-text', 'add-monogram', 'update-monogram', 'switch-product',
  'font-change', 'font-size-change', 'color-change', 'bold-change', 'italic-change', 'underline-change',
  'stroke-toggle', 'stroke-color-change', 'stroke-width-change',
  'shadow-toggle', 'shadow-color-change', 'shadow-blur-change', 'shadow-offset-x-change', 'shadow-offset-y-change', 'shadow-opacity-change',
  'engrave-toggle', 'letter-spacing-change', 'line-height-change',
  'update:brush-size', 'update:brush-color', 'clear-drawing', 'finish-drawing'
]);

const fileInput = ref(null);
const fileInputRef = ref(null);
const activeMenu = ref(null);

const selectedFont = ref('Roboto');
const fontSize = ref(32);
const textColor = ref('#000000');
const isBold = ref(false);
const isItalic = ref(false);
const isUnderline = ref(false);
const strokeEnabled = ref(false);
const strokeColor = ref('#FFFFFF');
const strokeWidth = ref(2);
const shadowEnabled = ref(false);
const shadowColor = ref('#000000');
const shadowBlur = ref(5);
const shadowOffsetX = ref(2);
const shadowOffsetY = ref(2);
const shadowOpacity = ref(0.5);
const engraveEnabled = ref(false);
const letterSpacing = ref(0);
const lineHeight = ref(1.2);
const fontSearchQuery = ref('');
const selectedFontCategory = ref('all');

// Font categories - dynamic based on selected element
const fontCategories = computed(() => {
  const selectedElement = editorStore.selectedElement;

  // For monograms, show monogram category only
  if (selectedElement && selectedElement.type === 'monogram') {
    return [
      { label: 'MONOGRAM', value: 'monogram' },
    ];
  }

  // For regular text, show all text categories
  return [
    { label: 'ALL FONTS', value: 'all' },
    { label: 'SANS SERIF', value: 'sans-serif' },
    { label: 'SERIF', value: 'serif' },
    { label: 'HANDWRIT', value: 'handwriting' },
  ];
});

// Font size presets
const fontSizePresets = [
  { label: 'Small', value: 12 },
  { label: 'Medium', value: 16 },
  { label: 'Large', value: 24 },
  { label: 'X-Large', value: 32 },
  { label: 'XX-Large', value: 48 },
  { label: 'Huge', value: 64 },
];

// Font options based on selected element type
const fontOptions = computed(() => {
  const selectedElement = editorStore.selectedElement;

  // Check if selected element is a monogram
  if (selectedElement && selectedElement.type === 'monogram') {
    // Return monogram fonts with consistent structure
    return CUSTOM_MONOGRAM_FONTS.map(font => ({
      label: font.label,
      value: font.value,
      category: 'monogram' // All monogram fonts in one category
    }));
  }

  // Return regular text fonts for text elements and default
  return AVAILABLE_FONTS.map(font => ({
    label: font.label,
    value: font.value,
    category: font.category
  }));
});

const isMobile = computed(() => $q.screen.lt.md);

const editingMonogramElement = computed(() => {
  const selectedElement = editorStore.selectedElement;
  if (selectedElement && selectedElement.type === 'monogram') {
    return selectedElement;
  }
  return null;
});

const productLabel = computed(() => {
  if (!productStore.currentProduct) return 'Product';
  const type = productStore.currentProduct.type.charAt(0).toUpperCase() + productStore.currentProduct.type.slice(1);
  return `${type} ${productStore.currentProduct.size}`;
});

const availableProducts = computed(() => {
  return [
    { type: 'bandit', size: '23oz' },
    { type: 'bandit', size: '30oz' },
    { type: 'tumbler', size: '20oz' },
    { type: 'tumbler', size: '30oz' },
    { type: 'mug', size: '11oz' },
    { type: 'mug', size: '15oz' }
  ];
});

const brushSizes = ref([
  { value: 2, label: 'Small' },
  { value: 5, label: 'Medium' },
  { value: 10, label: 'Large' },
  { value: 15, label: 'XL' }
]);

const colorPresets = ref([
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
]);

const currentBrushSize = computed(() => drawToolStore.brushSize);
const currentBrushColor = computed(() => drawToolStore.brushColor);

const filteredFonts = computed(() => {
  let fonts = fontOptions.value;

  if (selectedFontCategory.value !== 'all') {
    fonts = fonts.filter(font => font.category === selectedFontCategory.value);
  }

  if (fontSearchQuery.value) {
    const query = fontSearchQuery.value.toLowerCase();
    fonts = fonts.filter(font =>
      font.label.toLowerCase().includes(query)
    );
  }

  return fonts;
});

// Check if font size preset is active
const isFontSizePresetActive = (presetValue) => {
  return fontSize.value === presetValue;
};

// Watch for changes in textEditorStore to sync with selected element
watch(() => textEditorStore.selectedFont, (newFont) => {
  if (newFont && newFont !== selectedFont.value) {
    selectedFont.value = newFont;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedFontSize, (newSize) => {
  if (newSize && newSize !== fontSize.value) {
    fontSize.value = newSize;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedFontColor, (newColor) => {
  if (newColor && newColor !== textColor.value) {
    textColor.value = newColor;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedBold, (newBold) => {
  isBold.value = newBold;
}, { immediate: true });

watch(() => textEditorStore.selectedItalic, (newItalic) => {
  isItalic.value = newItalic;
}, { immediate: true });

watch(() => textEditorStore.selectedUnderline, (newUnderline) => {
  isUnderline.value = newUnderline;
}, { immediate: true });

watch(() => textEditorStore.selectedStroke, (newStroke) => {
  if (newStroke) {
    strokeEnabled.value = newStroke.enabled || false;
    strokeColor.value = newStroke.color || '#FFFFFF';
    strokeWidth.value = newStroke.width || 2;
  } else {
    // Reset to defaults if no stroke object
    strokeEnabled.value = false;
    strokeColor.value = '#FFFFFF';
    strokeWidth.value = 2;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedShadow, (newShadow) => {
  if (newShadow) {
    shadowEnabled.value = newShadow.enabled || false;
    shadowColor.value = newShadow.color || '#000000';
    shadowBlur.value = newShadow.blur || 5;
    shadowOffsetX.value = newShadow.offsetX || 2;
    shadowOffsetY.value = newShadow.offsetY || 2;
    shadowOpacity.value = newShadow.opacity || 0.5;
  } else {
    // Reset to defaults if no shadow object
    shadowEnabled.value = false;
    shadowColor.value = '#000000';
    shadowBlur.value = 5;
    shadowOffsetX.value = 2;
    shadowOffsetY.value = 2;
    shadowOpacity.value = 0.5;
  }
}, { immediate: true });

watch(() => textEditorStore.selectedEngrave, (newEngrave) => {
  engraveEnabled.value = newEngrave;
}, { immediate: true });

watch(() => textEditorStore.selectedLetterSpacing, (newSpacing) => {
  letterSpacing.value = newSpacing;
}, { immediate: true });

watch(() => textEditorStore.selectedLineHeight, (newHeight) => {
  lineHeight.value = newHeight;
}, { immediate: true });

// Watch for element type changes to reset font category
watch(() => editorStore.selectedElement?.type, (newType, oldType) => {
  // Reset category when switching between text and monogram
  if (newType === 'monogram') {
    selectedFontCategory.value = 'monogram';
  } else if (oldType === 'monogram' && newType !== 'monogram') {
    selectedFontCategory.value = 'all';
  }
});

const closeMenu = () => {
  // Deactivate draw tool when closing draw panel
  if (activeMenu.value === 'draw') {
    drawToolStore.isActive = false;
  }
  activeMenu.value = null;
};

const toggleMenu = (menu) => {
  if (activeMenu.value === menu) {
    activeMenu.value = null;
    // Deactivate draw tool when closing draw panel
    if (menu === 'draw') {
      drawToolStore.isActive = false;
    }
  } else {
    activeMenu.value = menu;
    // Activate draw tool when opening draw panel
    if (menu === 'draw') {
      drawToolStore.isActive = true;
      emit('activate-draw-tool');
    }
  }
};

const toggleTextMenu = () => {
  if (activeMenu.value === 'text') {
    activeMenu.value = null;
  } else {
    activeMenu.value = 'text';
  }
};

const openMonogramPanel = () => {
  activeMenu.value = 'monogram';
};

const closeMonogramPanel = () => {
  if (activeMenu.value === 'monogram') {
    activeMenu.value = null;
  }
};

const handleAddText = () => {
  emit('activate-text-tool');
  activeMenu.value = null;
};

const handleAdvancedText = () => {
  emit('open-advanced-text');
  activeMenu.value = null;
};



const handleMonogramAdd = (config) => {
  emit('add-monogram', config);
  activeMenu.value = null;
};

const handleMonogramUpdate = (config) => {
  emit('update-monogram', config);
};

const handleFontChange = (font) => {
  emit('font-change', font);
};

const handleFontSizeChange = (size) => {
  emit('font-size-change', size);
};

const handleColorChange = (color) => {
  emit('color-change', color);
};

const toggleBold = () => {
  isBold.value = !isBold.value;
  emit('bold-change', isBold.value);
};

const toggleItalic = () => {
  isItalic.value = !isItalic.value;
  emit('italic-change', isItalic.value);
};

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value;
  emit('underline-change', isUnderline.value);
};

const toggleStroke = () => {
  emit('stroke-toggle', strokeEnabled.value);
};

const handleStrokeColorChange = (color) => {
  emit('stroke-color-change', color);
};

const handleStrokeWidthChange = (width) => {
  emit('stroke-width-change', width);
};

const toggleShadow = () => {
  emit('shadow-toggle', shadowEnabled.value);
};

const handleShadowColorChange = (color) => {
  emit('shadow-color-change', color);
};

const handleShadowBlurChange = (blur) => {
  emit('shadow-blur-change', blur);
};

const handleShadowOffsetXChange = (offsetX) => {
  emit('shadow-offset-x-change', offsetX);
};

const handleShadowOffsetYChange = (offsetY) => {
  emit('shadow-offset-y-change', offsetY);
};

const handleShadowOpacityChange = (opacity) => {
  emit('shadow-opacity-change', opacity);
};

const toggleEngrave = () => {
  emit('engrave-toggle', engraveEnabled.value);
};

const handleLetterSpacingChange = (spacing) => {
  emit('letter-spacing-change', spacing);
};

const handleLineHeightChange = (height) => {
  emit('line-height-change', height);
};

const handleFontSizePreset = (size) => {
  fontSize.value = size;
  handleFontSizeChange(size);
};

const activateTextTool = () => {
  emit('activate-text-tool');
};

const openTextPanel = () => {
  activeMenu.value = 'text';
};

const closeTextPanel = () => {
  if (activeMenu.value === 'text') {
    activeMenu.value = null;
  }
};

defineExpose({
  openTextPanel,
  closeTextPanel,
  openMonogramPanel,
  closeMonogramPanel
});

const activateDrawTool = () => {
  emit('activate-draw-tool');
};

const handleFileSelected = (file) => {
  if (file) {
    emit('upload', file);
    nextTick(() => {
      fileInput.value = null;
    });
  }
};

const handleEmojiSelect = (emoji) => {
  emit('add-emoji', emoji);
  activeMenu.value = null;
};

const handleStickerSelect = (sticker) => {
  emit('add-image', sticker);
  activeMenu.value = null;
};

const handleCheckout = () => {
  emit('checkout');
};

const handleLayerUpdate = () => {
};

const isCurrentProduct = (product) => {
  if (!productStore.currentProduct) return false;
  return productStore.currentProduct.type === product.type && 
         productStore.currentProduct.size === product.size;
};

const selectProduct = (product) => {
  productStore.setCurrentProduct(product);
  emit('switch-product', product);
  activeMenu.value = null;
};

const updateBrushSize = (size) => {
  drawToolStore.setBrushSize(size);
  emit('update:brush-size', size);
};

const updateBrushColor = (color) => {
  drawToolStore.setBrushColor(color);
  emit('update:brush-color', color);
};

const clearDrawing = () => {
  emit('clear-drawing');
};

const finishDrawing = () => {
  emit('finish-drawing');
  drawToolStore.isActive = false;
  activeMenu.value = null;
};

watch(() => drawToolStore.isActive, (isActive) => {
  if (isActive && activeMenu.value !== 'draw') {
    activeMenu.value = 'draw'
  } else if (!isActive && activeMenu.value === 'draw') {
    activeMenu.value = null
  }
})

</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
.emoji-picker-wrapper :deep(.v3-emoji-picker) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.emoji-picker-wrapper :deep(.v3-header) {
  padding: 12px 0 !important;
  border-bottom: 1px solid #e5e7eb !important;
  margin-bottom: 12px !important;
}

.emoji-picker-wrapper :deep(.v3-search) {
  background: #f5f5f5 !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;
  font-size: 14px !important;
}

.emoji-picker-wrapper :deep(.v3-search:focus) {
  outline: none !important;
  border: 1px solid #a855f7 !important;
}

.emoji-picker-wrapper :deep(.v3-group) {
  padding: 4px 0 !important;
}

.emoji-picker-wrapper :deep(.v3-group-title) {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #374151 !important;
  padding: 8px 0 !important;
  margin-bottom: 8px !important;
}

.emoji-picker-wrapper :deep(.v3-emoji) {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  padding: 8px !important;
}

.emoji-picker-wrapper :deep(.v3-emoji:hover) {
  background: #faf5ff !important;
  transform: scale(1.2) !important;
}

.emoji-picker-wrapper :deep(.v3-tabs) {
  border-top: 1px solid #e5e7eb !important;
  padding-top: 12px !important;
  margin-top: 12px !important;
}

.emoji-picker-wrapper :deep(.v3-tab) {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.emoji-picker-wrapper :deep(.v3-tab:hover) {
  background: #f3f4f6 !important;
}

.emoji-picker-wrapper :deep(.v3-tab-active) {
  background: #faf5ff !important;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.section-icon {
  color: #1EADB0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.brush-size-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.size-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.size-option:hover {
  border-color: #1EADB0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
}

.size-option.active {
  border-color: #1EADB0;
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.2);
}

.size-indicator {
  border-radius: 50%;
  background: #1EADB0;
  transition: all 0.2s ease;
}

.size-option.active .size-indicator {
  background: #1EADB0;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1EADB0;
}

.size-2 { width: 6px; height: 6px; }
.size-5 { width: 10px; height: 10px; }
.size-10 { width: 14px; height: 14px; }
.size-15 { width: 18px; height: 18px; }

.size-label {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-option.active .size-label {
  color: #1EADB0;
  font-weight: 600;
}

.toolbar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(30, 173, 176, 0.2) 50%, transparent 100%);
}

.color-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-preset {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.color-preset:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-preset.active {
  border-color: #1EADB0;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1EADB0;
  transform: scale(1.05);
}

.custom-color-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.custom-color-wrapper:hover {
  border-color: #1EADB0;
}

.custom-color-picker {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  outline: none;
}

.custom-color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 6px;
}

.custom-color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.custom-color-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.modern-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
  justify-content: center;
}

.clear-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.clear-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.done-btn {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  border: 2px solid transparent;
}

.done-btn:hover {
  background: linear-gradient(135deg, #1a9ca0 0%, #3d4758 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.4);
}
</style>
