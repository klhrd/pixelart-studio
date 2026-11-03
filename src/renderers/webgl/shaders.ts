/**
 * Shader sources for WebGL rendering engines
 * Each engine has a vertex and fragment shader
 */

export const SHADERS: Record<string, { vertex: string; fragment: string }> = {
  // ============================================
  // MOON PHASE SHADER
  // ============================================
  moon: {
    vertex: `
      attribute vec2 a_position;
      attribute vec2 a_center;
      attribute float a_radius;
      attribute float a_phase;
      attribute float a_rotation;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      varying vec2 v_center;
      varying float v_radius;
      varying float v_phase;
      varying float v_rotation;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
        v_center = a_center;
        v_radius = a_radius;
        v_phase = a_phase;
        v_rotation = a_rotation;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      varying vec2 v_center;
      varying float v_radius;
      varying float v_phase;
      varying float v_rotation;
      
      uniform vec3 u_color;
      
      void main() {
        vec2 offset = v_position - v_center;
        
        // Rotate coordinates
        float cos_r = cos(v_rotation);
        float sin_r = sin(v_rotation);
        float rotated_x = offset.x * cos_r - offset.y * sin_r;
        float rotated_y = offset.x * sin_r + offset.y * cos_r;
        
        float dist = length(vec2(rotated_x, rotated_y));
        
        if (dist > v_radius) {
          discard;
        }
        
        // Moon phase calculation
        float k = cos(v_phase * 3.14159265);
        float terminator_x = k * v_radius;
        
        float lit = 0.0;
        if (v_phase <= 0.5) {
          lit = rotated_x > terminator_x ? 1.0 : 0.0;
        } else {
          lit = rotated_x < terminator_x ? 1.0 : 0.0;
        }
        
        vec3 color = mix(vec3(0.0), u_color, lit);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // TRUCHET TILES SHADER
  // ============================================
  truchet: {
    vertex: `
      attribute vec2 a_position;
      attribute vec2 a_center;
      attribute float a_rotation;
      attribute float a_luminance;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      varying vec2 v_center;
      varying float v_rotation;
      varying float v_luminance;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
        v_center = a_center;
        v_rotation = a_rotation;
        v_luminance = a_luminance;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      varying vec2 v_center;
      varying float v_rotation;
      varying float v_luminance;
      
      uniform vec3 u_color;
      
      void main() {
        vec2 offset = v_position - v_center;
        
        // Rotate coordinates
        float cos_r = cos(v_rotation);
        float sin_r = sin(v_rotation);
        float rotated_x = offset.x * cos_r - offset.y * sin_r;
        float rotated_y = offset.x * sin_r + offset.y * cos_r;
        
        // Truchet pattern: quarter circles
        float d = 0.0;
        float r = length(offset);
        
        if (rotated_x > 0.0 && rotated_y > 0.0) {
          // Top-right quadrant
          d = distance(rotated_x, rotated_y) / v_center.x;
        } else if (rotated_x < 0.0 && rotated_y < 0.0) {
          // Bottom-left quadrant
          d = distance(rotated_x, rotated_y) / v_center.x;
        }
        
        float stroke = step(d, 0.5) * step(0.7, d);
        
        vec3 color = mix(vec3(0.0), u_color, stroke);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // VORONOI SHADER
  // ============================================
  voronoi: {
    vertex: `
      attribute vec2 a_position;
      attribute float a_index;
      
      uniform vec2 u_resolution;
      uniform float u_count;
      
      varying vec2 v_position;
      varying float v_index;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
        v_index = a_index;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      varying float v_index;
      
      uniform vec2 u_resolution;
      uniform float u_count;
      uniform vec2 u_sites[256];
      uniform vec3 u_colors[256];
      
      void main() {
        float minDist = 10000.0;
        int nearestIndex = 0;
        
        for (int i = 0; i < 256; i++) {
          if (float(i) >= u_count) break;
          vec2 diff = v_position - u_sites[i];
          float dist = length(diff);
          if (dist < minDist) {
            minDist = dist;
            nearestIndex = i;
          }
        }
        
        vec3 color = u_colors[nearestIndex];
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // BRAILLE SHADER
  // ============================================
  braille: {
    vertex: `
      attribute vec2 a_position;
      attribute vec2 a_center;
      attribute float a_bit;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      varying vec2 v_center;
      varying float v_bit;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
        v_center = a_center;
        v_bit = a_bit;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      varying vec2 v_center;
      varying float v_bit;
      
      uniform vec3 u_color;
      
      void main() {
        vec2 offset = v_position - v_center;
        float dist = length(offset);
        
        float r = v_size * 0.15;
        float inDot = step(dist, r);
        
        vec3 color = mix(vec3(0.0), u_color, inDot);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // STIPPLE SHADER
  // ============================================
  stipple: {
    vertex: `
      attribute vec2 a_position;
      attribute float a_radius;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      varying float v_radius;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
        v_radius = a_radius;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      varying float v_radius;
      
      uniform vec3 u_color;
      
      void main() {
        float dist = length(v_position);
        float inDot = step(dist, v_radius);
        
        vec3 color = mix(vec3(0.0), u_color, inDot);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // FLOW FIELD SHADER
  // ============================================
  flow: {
    vertex: `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      
      void main() {
        // Simple flow field pattern
        float x = v_position.x / u_resolution.x;
        float y = v_position.y / u_resolution.y;
        
        float wave = sin(x * 10.0 + y * 10.0) * 0.5 + 0.5;
        float intensity = smoothstep(0.4, 0.6, wave);
        
        vec3 color = mix(vec3(0.0), u_color, intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // HEX DUMP SHADER
  // ============================================
  hexdump: {
    vertex: `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_texCoord;
      
      uniform sampler2D u_texture;
      uniform vec3 u_color;
      
      void main() {
        vec4 tex = texture2D(u_texture, v_texCoord);
        float luminance = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        
        // Hex character selection based on luminance
        float hexIndex = floor(luminance * 16.0);
        hexIndex = clamp(hexIndex, 0.0, 15.0);
        
        vec3 color = mix(vec3(0.0), u_color, luminance);
        gl_FragColor = vec4(color, tex.a);
      }
    `,
  },

  // ============================================
  // BENDAY DOTS SHADER
  // ============================================
  benday: {
    vertex: `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      
      void main() {
        float x = v_position.x / u_resolution.x;
        float y = v_position.y / u_resolution.y;
        
        // Halftone dot pattern
        float dot = sin(x * 50.0) * sin(y * 50.0);
        float intensity = smoothstep(0.0, 1.0, dot);
        
        vec3 color = mix(vec3(0.0), u_color, intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // WAVE INTERFERENCE SHADER
  // ============================================
  wave: {
    vertex: `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      
      void main() {
        float x = v_position.x / u_resolution.x;
        float y = v_position.y / u_resolution.y;
        
        // Sine wave pattern
        float wave = sin(x * 50.0) * 0.5 + 0.5;
        float intensity = smoothstep(0.4, 0.6, wave);
        
        vec3 color = mix(vec3(0.0), u_color, intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // CONTOUR SHADER
  // ============================================
  contour: {
    vertex: `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      
      void main() {
        float x = v_position.x / u_resolution.x;
        float y = v_position.y / u_resolution.y;
        
        // Contour lines
        float contour = sin(x * 100.0 + y * 100.0) * 0.5 + 0.5;
        float intensity = smoothstep(0.45, 0.55, contour);
        
        vec3 color = mix(vec3(0.0), u_color, intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // STRING ART SHADER
  // ============================================
  stringart: {
    vertex: `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      
      void main() {
        float x = v_position.x / u_resolution.x;
        float y = v_position.y / u_resolution.y;
        
        // String art pattern
        float lines = sin(x * 200.0) * cos(y * 200.0) * 0.5 + 0.5;
        float intensity = smoothstep(0.45, 0.55, lines);
        
        vec3 color = mix(vec3(0.0), u_color, intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // TURING PATTERNS SHADER
  // ============================================
  turing: {
    vertex: `
      attribute vec2 a_position;
      
      uniform vec2 u_resolution;
      
      varying vec2 v_position;
      
      void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        
        v_position = a_position;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_position;
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      
      void main() {
        float x = v_position.x / u_resolution.x;
        float y = v_position.y / u_resolution.y;
        
        // Turing pattern (reaction-diffusion approximation)
        float pattern = sin(x * 30.0 + sin(y * 30.0)) * 0.5 + 0.5;
        float intensity = smoothstep(0.4, 0.6, pattern);
        
        vec3 color = mix(vec3(0.0), u_color, intensity);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },

  // ============================================
  // PIXEL SORTING SHADER
  // ============================================
  pixelsort: {
    vertex: `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `,
    fragment: `
      precision mediump float;
      
      varying vec2 v_texCoord;
      
      uniform sampler2D u_texture;
      uniform vec3 u_color;
      
      void main() {
        vec4 tex = texture2D(u_texture, v_texCoord);
        float luminance = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        
        vec3 color = mix(vec3(0.0), u_color, luminance);
        gl_FragColor = vec4(color, tex.a);
      }
    `,
  },
};
