import { useEffect, useRef, useState } from "react";
const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 pointer;
uniform float progress;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float torus(vec3 p,float major,float minor){return length(vec2(length(p.xz)-major,p.y))-minor;}
vec3 turn(vec3 p){p.xy=rot(-.35+pointer.x*.4)*p.xy;p.yz=rot(.8+pointer.y*.4)*p.yz;return p;}
vec2 map(vec3 p){vec3 q=turn(p);float a=atan(q.z,q.x)+3.14159265;float ring=torus(q,1.22,.26);vec2 d=vec2(ring,1.);vec3 r=p;r.xy=rot(.75+time*.1)*r.xy;r.yz=rot(.6)*r.yz;float outer=torus(r,1.82,.018);if(outer<d.x)d=vec2(outer,2.);vec3 bead=vec3(cos(time*.4)*1.82,0.,sin(time*.4)*1.82);bead.yz=rot(-.6)*bead.yz;bead.xy=rot(-.75-time*.1)*bead.xy;float ball=length(p-bead)-.09;if(ball<d.x)d=vec2(ball,3.);return d;}
vec3 normal(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x,map(p+e.yxy).x-map(p-e.yxy).x,map(p+e.yyx).x-map(p-e.yyx).x));}
void main(){vec2 uv=(gl_FragCoord.xy*2.-resolution)/resolution.y;vec3 ro=vec3(0.,0.,5.5);vec3 rd=normalize(vec3(uv,-3.));float t=0.;vec2 hit;for(int i=0;i<80;i++){hit=map(ro+rd*t);if(hit.x<.002||t>9.)break;t+=hit.x*.8;}
vec3 col=vec3(.057,.062,.052)+.025*max(0.,1.-length(uv)*.4);if(t<9.){vec3 p=ro+rd*t;vec3 n=normal(p);vec3 light=normalize(vec3(-3.,4.,4.));float dif=max(dot(n,light),0.);float spec=pow(max(dot(reflect(-light,n),-rd),0.),36.);float fres=pow(1.-max(dot(n,-rd),0.),3.);vec3 q=turn(p);float angle=(atan(q.z,q.x)+3.14159265)/6.2831853;vec3 base=angle<progress?vec3(.77,.98,.20):vec3(.19,.22,.14);if(hit.y>1.5)base=vec3(.37,.41,.29);if(hit.y>2.5)base=vec3(1.,.35,.1);col=base*(.25+dif*.75)+vec3(.94,1.,.70)*spec*.7+vec3(.57,.70,.3)*fres*.35;float band=pow(max(0.,sin(q.x*1.5+q.z*2.+1.)),25.);col+=band*.12;}
col=pow(col,vec3(.92));gl_FragColor=vec4(col,1.);}`;
export function OrbitScene({ percent }: { percent: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(percent);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    progressRef.current = percent;
  }, [percent]);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFallback(true);
      return;
    }
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error("Shader compilation failed");
      return s;
    };
    let program: WebGLProgram;
    let vs: WebGLShader, fs: WebGLShader;
    try {
      vs = compile(gl.VERTEX_SHADER, vertex);
      fs = compile(gl.FRAGMENT_SHADER, fragment);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Link failed");
    } catch {
      setFallback(true);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "resolution"),
      time = gl.getUniformLocation(program, "time"),
      pointer = gl.getUniformLocation(program, "pointer"),
      progress = gl.getUniformLocation(program, "progress");
    let frame = 0,
      last = 0,
      visible = true,
      dragging = false,
      x = 0,
      y = 0,
      tx = 0,
      ty = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = new ResizeObserver(() => {
      const r = el.getBoundingClientRect(),
        dpr = Math.min(window.devicePixelRatio, 1.35);
      el.width = Math.round(r.width * dpr);
      el.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, el.width, el.height);
    });
    resize.observe(el);
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    observer.observe(el);
    const down = (e: PointerEvent) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && !dragging) return;
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const up = () => {
      dragging = false;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    function draw(now: number) {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden || now - last < 32) return;
      last = now;
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      gl!.uniform2f(resolution, el!.width, el!.height);
      gl!.uniform1f(time, reduce.matches ? 0 : now * 0.001);
      gl!.uniform2f(pointer, reduce.matches ? 0 : x, reduce.matches ? 0 : y);
      gl!.uniform1f(progress, progressRef.current / 100);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    }
    frame = requestAnimationFrame(draw);
    const lost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
      cancelAnimationFrame(frame);
    };
    el.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("webglcontextlost", lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);
  return fallback ? (
    <div className="orbit-fallback" aria-hidden="true" />
  ) : (
    <canvas ref={canvas} className="orbit-canvas" aria-hidden="true" />
  );
}
