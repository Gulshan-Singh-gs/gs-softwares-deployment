// src/suites/image/registry/toolTaxonomy.ts
import { ToolCategory } from '../store/types';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  suggestedPrompt?: string;
  inputs: 'prompt' | 'brush' | 'split' | 'matrix' | 'face' | 'none';
}

export interface CategoryGroup {
  id: ToolCategory;
  name: string;
  shortLabel: string;
  description: string;
  iconName: string;
  tools: ToolItem[];
}

export const TOOL_CATEGORIES: CategoryGroup[] = [
  {
    id: 'generate',
    name: 'Generate',
    shortLabel: 'Gen',
    description: 'Text to image, Image to image, concepts, and transparent generation',
    iconName: 'Sparkles',
    tools: [
      { id: 'generate.text_to_image', name: 'Text → Image', category: 'generate', description: 'Synthesize images from descriptive prompt', inputs: 'prompt' },
      { id: 'generate.img_to_img', name: 'Image → Image', category: 'generate', description: 'Re-imagine active image with stylistic guidance', inputs: 'prompt' },
      { id: 'generate.concept_art', name: 'Concept Art', category: 'generate', description: 'High-concept cinematic visual development', inputs: 'prompt' },
      { id: 'generate.transparent', name: 'Transparent Asset', category: 'generate', description: 'Isolated subject with clean alpha channel', inputs: 'prompt' },
    ]
  },
  {
    id: 'edit',
    name: 'Edit',
    shortLabel: 'Edit',
    description: 'Generative fill, object erase/replace, inpainting, and relighting',
    iconName: 'Wand2',
    tools: [
      { id: 'edit.generative_fill', name: 'Generative Fill', category: 'edit', description: 'Select region and synthesise new elements', inputs: 'brush' },
      { id: 'edit.object_erase', name: 'Object Erase', category: 'edit', description: 'Seamless context-aware removal', inputs: 'brush' },
      { id: 'edit.relight', name: 'Relight Studio', category: 'edit', description: 'Adjust virtual light direction and ambient warmth', inputs: 'prompt' },
      { id: 'edit.weather', name: 'Atmosphere & Mood', category: 'edit', description: 'Shift golden hour, overcast, mist, or rain', inputs: 'prompt' },
    ]
  },
  {
    id: 'enhance',
    name: 'Enhance',
    shortLabel: 'Upscale',
    description: 'AI Super-resolution, sharpen, deblur, low-light recovery, color restoration',
    iconName: 'Zap',
    tools: [
      { id: 'enhance.upscale', name: 'AI Super Resolution', category: 'enhance', description: '2x/4x Neural upscaling with texture synthesis', inputs: 'split' },
      { id: 'enhance.sharpen', name: 'Deblur & Sharpen', category: 'enhance', description: 'Motion blur mitigation and edge recovery', inputs: 'split' },
      { id: 'enhance.lowlight', name: 'Low Light Boost', category: 'enhance', description: 'Dynamic exposure balance & shadow detail lift', inputs: 'split' },
      { id: 'enhance.restore', name: 'Old Photo Restore', category: 'enhance', description: 'Scratch suppression & vintage colorization', inputs: 'split' },
    ]
  },
  {
    id: 'background',
    name: 'Background',
    shortLabel: 'BG',
    description: 'Instant zero-upload cutout, backdrop generation, bokeh depth blur',
    iconName: 'Layers',
    tools: [
      { id: 'background.remove', name: 'Remove Background', category: 'background', description: 'Zero-latency alpha extraction', inputs: 'none' },
      { id: 'background.replace', name: 'Generative Backdrop', category: 'background', description: 'Place subject in studio or natural scenes', inputs: 'prompt' },
      { id: 'background.blur', name: 'Depth Bokeh Blur', category: 'background', description: 'Optical lens depth simulation', inputs: 'split' },
    ]
  },
  {
    id: 'portrait',
    name: 'Portrait',
    shortLabel: 'Face',
    description: 'Facial clarity, skin texture, studio portrait relight, expression transfer',
    iconName: 'Smile',
    tools: [
      { id: 'portrait.face_enhance', name: 'Face Retouch', category: 'portrait', description: 'Preserve micro-pores while smoothing blemishes', inputs: 'face' },
      { id: 'portrait.relight', name: 'Portrait Relighting', category: 'portrait', description: 'Rim light, softbox, or spotlight positioning', inputs: 'face' },
      { id: 'portrait.expression', name: 'Expression Shift', category: 'portrait', description: 'Subtle smile, intensity, or gaze realignment', inputs: 'face' },
    ]
  },
  {
    id: 'character',
    name: 'Character',
    shortLabel: 'Actor',
    description: 'Consistent character generation, pose replication, outfit synchronization',
    iconName: 'UserCheck',
    tools: [
      { id: 'character.consistency', name: 'Identity Preserver', category: 'character', description: 'Maintain facial bone structure across renders', inputs: 'prompt' },
      { id: 'character.pose', name: 'Pose Transfer', category: 'character', description: 'Mimic anatomical gesture from reference pose', inputs: 'matrix' },
    ]
  },
  {
    id: 'fashion',
    name: 'Fashion',
    shortLabel: 'Wear',
    description: 'Virtual try-on, apparel replacement, garment drape reconstruction',
    iconName: 'Shirt',
    tools: [
      { id: 'fashion.try_on', name: 'Virtual Try-On', category: 'fashion', description: 'Fit apparel textures seamlessly on model', inputs: 'prompt' },
      { id: 'fashion.photoshoot', name: 'Editorial Photoshoot', category: 'fashion', description: 'Runway & studio lighting aesthetic synthesis', inputs: 'prompt' },
    ]
  },
  {
    id: 'product',
    name: 'Product',
    shortLabel: 'Studio',
    description: 'E-commerce staging, pedestal synthesis, contact shadow simulation',
    iconName: 'Package',
    tools: [
      { id: 'product.stage', name: 'Podium & Scene', category: 'product', description: 'Place bottle, watch, or shoe in staged studio', inputs: 'prompt' },
      { id: 'product.shadow', name: 'Raytraced Shadows', category: 'product', description: 'Realistic ground plane reflection & ambient occlusion', inputs: 'split' },
    ]
  },
  {
    id: 'design',
    name: 'Design',
    shortLabel: 'Layout',
    description: 'Social creatives, thumbnails, aspect framing, banner generation',
    iconName: 'LayoutGrid',
    tools: [
      { id: 'design.thumbnail', name: 'Social Thumbnail', category: 'design', description: 'High-contrast 16:9 click-optimized composition', inputs: 'prompt' },
      { id: 'design.poster', name: 'Editorial Poster', category: 'design', description: 'Balanced visual hierarchy for print and web', inputs: 'prompt' },
    ]
  },
  {
    id: 'typography',
    name: 'Typography',
    shortLabel: 'Type',
    description: 'AI text rendering, headline stylization, font matching',
    iconName: 'Type',
    tools: [
      { id: 'typography.style', name: 'Lettering Synthesis', category: 'typography', description: 'Embossed, chrome, neon, and organic typography', inputs: 'prompt' },
    ]
  },
  {
    id: 'transform',
    name: 'Transform',
    shortLabel: 'Style',
    description: 'Artistic style transfer: Anime, 3D render, Watercolor, Pixel art, Clay',
    iconName: 'Palette',
    tools: [
      { id: 'transform.anime', name: 'Anime Cel Shader', category: 'transform', description: 'Clean ink line-art with vibrant color grading', inputs: 'split' },
      { id: 'transform.3d', name: '3D Isometric Render', category: 'transform', description: 'Stylized 3D CGI clay & octane shader', inputs: 'split' },
      { id: 'transform.pixel', name: 'Retro Pixel Art', category: 'transform', description: '16-bit retro dithering and palette restriction', inputs: 'split' },
      { id: 'transform.watercolor', name: 'Traditional Watercolor', category: 'transform', description: 'Pigment diffusion and rough paper texture', inputs: 'split' },
    ]
  },
  {
    id: 'vision',
    name: 'Vision',
    shortLabel: 'Vision',
    description: 'On-device image understanding, automated reverse prompt generation, tags',
    iconName: 'ScanEye',
    tools: [
      { id: 'vision.reverse_prompt', name: 'Image → Prompt', category: 'vision', description: 'Deconstruct lighting, medium, subject into prompts', inputs: 'none' },
      { id: 'vision.palette', name: 'Harmonic Palette', category: 'vision', description: 'Extract dominant color clusters and HEX codes', inputs: 'none' },
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced',
    shortLabel: 'Nodes',
    description: 'Depth maps, Canny edge detection, OpenPose, ControlNet conditioning',
    iconName: 'Cpu',
    tools: [
      { id: 'advanced.canny', name: 'Canny Edge Extraction', category: 'advanced', description: 'High-fidelity edge wireframes for geometry locking', inputs: 'none' },
      { id: 'advanced.depth', name: 'Depth Map Estimation', category: 'advanced', description: 'Z-buffer gradient estimation for 3D displacement', inputs: 'none' },
    ]
  }
];
