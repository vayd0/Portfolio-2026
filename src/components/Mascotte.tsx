"use client";
import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
gsap.registerPlugin(MorphSVGPlugin);

const MAX = 110;
const MAX_H = 55;
const SQUINT = 35;

const LEFT_HEART = "M624.12,1260.32 C688.35,1255.57 716.46,1304.74 724.12,1339.87 C739.72,1302.30 786.70,1248.20 865.28,1290.77 C878.89,1298.15 890.36,1309.60 898.09,1323.24 C978.55,1465.20 802.50,1567.59 698.09,1600.97 L698.09,1600.98 C609.03,1548.50 467.50,1422.56 541.86,1309.79 C560.27,1281.88 591.19,1262.76 624.12,1260.32 Z";
const RIGHT_HEART = "M1537.12,1250.32 C1601.35,1245.57 1629.46,1294.74 1637.12,1329.87 C1652.72,1292.30 1699.70,1238.20 1778.28,1280.77 C1791.89,1288.15 1803.36,1299.60 1811.09,1313.24 C1891.55,1455.20 1715.50,1557.59 1611.09,1590.97 L1611.09,1590.98 C1522.03,1538.50 1380.50,1412.56 1454.86,1299.79 C1473.27,1271.88 1504.19,1252.76 1537.12,1250.32 Z";

export interface MascotteHandle {
  exitLook: () => void;
}

type TransformMode = "rotate90flip" | "rotate90" | "flipX" | "rotateNeg90";

const Mascotte = forwardRef<MascotteHandle, { className?: string; style?: React.CSSProperties; transformMode?: TransformMode }>(
  function Mascotte({ className, style, transformMode = "rotate90flip" }, handle) {
    const svgRef = useRef<SVGSVGElement>(null);
    const breathRef = useRef<HTMLDivElement>(null);
    const leftEyeGroupRef = useRef<SVGGElement>(null);
    const rightEyeGroupRef = useRef<SVGGElement>(null);
    const leftPupilScaleRef = useRef<SVGGElement>(null);
    const rightPupilScaleRef = useRef<SVGGElement>(null);
    const leftPupilRef = useRef<SVGGElement>(null);
    const rightPupilRef = useRef<SVGGElement>(null);
    const leftPupilPathRef = useRef<SVGPathElement>(null);
    const rightPupilPathRef = useRef<SVGPathElement>(null);
    const leftBlurRef = useRef<SVGFEGaussianBlurElement>(null);
    const rightBlurRef = useRef<SVGFEGaussianBlurElement>(null);
    const contactProximityRef = useRef(0);
    const isMorphedRef = useRef(false);

    useImperativeHandle(handle, () => ({
      exitLook: () => {
        const left = leftPupilRef.current;
        const right = rightPupilRef.current;
        if (!left || !right) return;
        gsap.killTweensOf([left, right]);
        gsap.to(left, { x: SQUINT, y: MAX, duration: 0.1, ease: "power3.out" });
        gsap.to(right, { x: -SQUINT, y: MAX, duration: 0.1, ease: "power3.out" });
      },
    }));

    useEffect(() => {
      const svg = svgRef.current;
      const leftGroup = leftEyeGroupRef.current;
      const rightGroup = rightEyeGroupRef.current;
      const left = leftPupilRef.current;
      const right = rightPupilRef.current;
      const leftScale = leftPupilScaleRef.current;
      const rightScale = rightPupilScaleRef.current;
      const leftPath = leftPupilPathRef.current;
      const rightPath = rightPupilPathRef.current;
      if (!svg || !leftGroup || !rightGroup || !left || !right || !leftScale || !rightScale || !leftPath || !rightPath) return;
      const mode = transformMode;
      const leftOriginal = leftPath.getAttribute("d") ?? "";
      const rightOriginal = rightPath.getAttribute("d") ?? "";
      let leftRotTween: gsap.core.Tween | null = null;
      let rightRotTween: gsap.core.Tween | null = null;

      const lx = gsap.quickTo(left, "x", { duration: 0.6, ease: "power3.out" });
      const ly = gsap.quickTo(left, "y", { duration: 0.6, ease: "power3.out" });
      const rx = gsap.quickTo(right, "x", { duration: 0.6, ease: "power3.out" });
      const ry = gsap.quickTo(right, "y", { duration: 0.6, ease: "power3.out" });

      gsap.set(leftScale, { svgOrigin: "720 1430" });
      gsap.set(rightScale, { svgOrigin: "1630 1420" });

      let wasOffScreen = true;

      const onMouseMove = (e: MouseEvent) => {
        const rect = svg.getBoundingClientRect();
        const offScreen =
          rect.width === 0 || rect.height === 0 ||
          rect.top > window.innerHeight + 20 ||
          rect.bottom < -20 ||
          rect.left > window.innerWidth + 20 ||
          rect.right < -20;

        if (offScreen) {
          wasOffScreen = true;
          return;
        }

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const t = Math.min(dist / (Math.max(rect.width, rect.height) * 0.8), 1);
        const ndx = (dx / dist) * t;
        const ndy = (dy / dist) * t;

        let tlx: number, tly: number, trx: number, try_: number;
        if (mode === "flipX") {
          tlx = -ndx * MAX_H + SQUINT; tly = ndy * MAX;
          trx = -ndx * MAX_H - SQUINT; try_ = ndy * MAX;
        } else if (mode === "rotate90") {
          tlx = ndy * MAX_H + SQUINT; tly = -ndx * MAX;
          trx = ndy * MAX_H - SQUINT; try_ = -ndx * MAX;
        } else if (mode === "rotateNeg90") {
          tlx = -ndy * MAX_H + SQUINT; tly = ndx * MAX;
          trx = -ndy * MAX_H - SQUINT; try_ = ndx * MAX;
        } else {
          tlx = ndy * MAX_H + SQUINT; tly = ndx * MAX;
          trx = ndy * MAX_H - SQUINT; try_ = ndx * MAX;
        }

        if (wasOffScreen) {
          gsap.set(left, { x: tlx, y: tly });
          gsap.set(right, { x: trx, y: try_ });
          wasOffScreen = false;
        }

        lx(tlx); ly(tly); rx(trx); ry(try_);

        const contactBtn = document.querySelector('[data-contact-btn]');
        if (contactBtn) {
          const cr = contactBtn.getBoundingClientRect();
          const cdx = e.clientX - (cr.left + cr.width / 2);
          const cdy = e.clientY - (cr.top + cr.height / 2);
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          contactProximityRef.current = Math.max(0, 1 - cdist / 350);
        }
        const scaleVal = 1 + contactProximityRef.current * 0.6;
        gsap.to(leftScale, { scaleX: scaleVal, scaleY: scaleVal, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        gsap.to(rightScale, { scaleX: scaleVal, scaleY: scaleVal, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      };

      window.addEventListener("mousemove", onMouseMove);

      const shakePhase = { v: 0 };
      const shakeTick = () => {
        const cp = contactProximityRef.current;

        if (cp >= 0.88 && !isMorphedRef.current) {
          isMorphedRef.current = true;
          gsap.to(leftPath, { morphSVG: LEFT_HEART, fill: "#FF3B3B", duration: 0.5, ease: "elastic.out(1, 0.4)" });
          gsap.to(rightPath, { morphSVG: RIGHT_HEART, fill: "#FF3B3B", duration: 0.5, ease: "elastic.out(1, 0.4)" });
          leftRotTween = gsap.to(leftScale, { rotation: "+=360", duration: 0.55, ease: "elastic.out(1, 0.35)" });
          rightRotTween = gsap.to(rightScale, { rotation: "+=360", duration: 0.55, ease: "elastic.out(1, 0.35)" });
          gsap.fromTo(leftBlurRef.current, { attr: { stdDeviation: 18 } }, { attr: { stdDeviation: 0 }, duration: 0.35, ease: "power4.out" });
          gsap.fromTo(rightBlurRef.current, { attr: { stdDeviation: 18 } }, { attr: { stdDeviation: 0 }, duration: 0.35, ease: "power4.out" });
        } else if (cp < 0.7 && isMorphedRef.current) {
          isMorphedRef.current = false;
          leftRotTween?.kill(); leftRotTween = null;
          rightRotTween?.kill(); rightRotTween = null;
          gsap.to(leftScale, { rotation: 0, duration: 0.45, ease: "elastic.out(1, 0.4)" });
          gsap.to(rightScale, { rotation: 0, duration: 0.45, ease: "elastic.out(1, 0.4)" });
          gsap.to(leftPath, { morphSVG: leftOriginal, fill: "#000000", duration: 0.4, ease: "elastic.out(1, 0.4)" });
          gsap.to(rightPath, { morphSVG: rightOriginal, fill: "#000000", duration: 0.4, ease: "elastic.out(1, 0.4)" });
        }

        if (cp < 0.01) {
          if (shakePhase.v !== 0) {
            gsap.set([leftScale, rightScale], { x: 0, y: 0 });
            shakePhase.v = 0;
          }
          return;
        }
        shakePhase.v += 1;
        const amp = cp * 7;
        gsap.set(leftScale, {
          x: (Math.sin(shakePhase.v * 0.78) * 0.7 + Math.sin(shakePhase.v * 1.35) * 0.3) * amp,
          y: Math.cos(shakePhase.v * 0.58) * amp * 0.35,
        });
        gsap.set(rightScale, {
          x: (Math.sin(shakePhase.v * 0.72 + 0.4) * 0.7 + Math.sin(shakePhase.v * 1.28 + 0.3) * 0.3) * amp,
          y: Math.cos(shakePhase.v * 0.62 + 0.2) * amp * 0.35,
        });
      };
      gsap.ticker.add(shakeTick);

      gsap.set([leftGroup, rightGroup], { transformOrigin: "50% 50%" });

      let nextBlink: gsap.core.Tween | null = null;

      const doBlink = () => {
        gsap.timeline({
          onComplete: () => {
            nextBlink = gsap.delayedCall(2 + Math.random() * 4, doBlink);
          },
        })
          .to([leftGroup, rightGroup], { scaleY: 0, duration: 0.07, ease: "power2.in" })
          .to([leftGroup, rightGroup], { scaleY: 1, duration: 0.12, ease: "power2.out" });
      };

      nextBlink = gsap.delayedCall(1.5 + Math.random() * 3, doBlink);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        gsap.ticker.remove(shakeTick);
        nextBlink?.kill();
        gsap.killTweensOf([left, right, leftGroup, rightGroup, leftScale, rightScale]);
        gsap.set([leftScale, rightScale], { x: 0, y: 0, scaleX: 1, scaleY: 1 });
      };
    }, []);

    useEffect(() => {
      const el = breathRef.current;
      if (!el) return;
      const tween = gsap.to(el, {
        scaleX: 1.02,
        scaleY: 0.98,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      return () => { tween.kill(); };
    }, []);

    return (
      <div className={className} style={style}>
        <div ref={breathRef} style={{ transformOrigin: "center center" }}>
          <svg ref={svgRef} width="2325" height="1849" viewBox="0 0 2325 1849" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <clipPath id="mascotte-left-eye-clip">
                <path d="M781.674 1659.76C1013.51 1627.91 1098.11 1493.87 1111.44 1430.83C1135.42 1359.17 1101.45 1278.21 1081.46 1246.7C813.651 876.433 550.173 1027.72 441.917 1157.12C333.995 1256.65 346.985 1432.49 376.964 1500.5C415.27 1566.86 549.84 1691.61 781.674 1659.76Z"/>
              </clipPath>
              <clipPath id="mascotte-right-eye-clip">
                <path d="M1585.04 1659.76C1353.2 1627.91 1268.6 1493.87 1255.28 1430.83C1231.29 1359.17 1265.27 1278.21 1285.25 1246.7C1553.06 876.433 1816.54 1027.72 1924.8 1157.12C2032.72 1256.65 2019.73 1432.49 1989.75 1500.5C1951.44 1566.86 1816.87 1691.61 1585.04 1659.76Z"/>
              </clipPath>
              <filter id="filter0_g_624_10950" x="0" y="0" width="2324.02" height="1848.69" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feTurbulence type="fractalNoise" baseFrequency="0.021376656368374825 0.021376656368374825" numOctaves={3} seed={1325}/>
                <feDisplacementMap in="shape" scale={8} xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
                <feMerge result="effect1_texture_624_10950"><feMergeNode in="displacedImage"/></feMerge>
              </filter>
              <filter id="filter1_g_624_10950" x="351.794" y="1009.84" width="771.892" height="659.034" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feTurbulence type="fractalNoise" baseFrequency="0.021376656368374825 0.021376656368374825" numOctaves={3} seed={1325}/>
                <feDisplacementMap in="shape" scale={8} xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
                <feMerge result="effect1_texture_624_10950"><feMergeNode in="displacedImage"/></feMerge>
              </filter>
              <filter id="filter2_g_624_10950" x="1243.03" y="1009.84" width="771.892" height="659.034" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feTurbulence type="fractalNoise" baseFrequency="0.021376656368374825 0.021376656368374825" numOctaves={3} seed={1325}/>
                <feDisplacementMap in="shape" scale={8} xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
                <feMerge result="effect1_texture_624_10950"><feMergeNode in="displacedImage"/></feMerge>
              </filter>
              <filter id="filter3_g_624_10950" x="456.221" y="1232.44" width="519.973" height="404.42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feTurbulence type="fractalNoise" baseFrequency="0.021376656368374825 0.021376656368374825" numOctaves={3} seed={1325}/>
                <feDisplacementMap in="shape" scale={8} xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
                <feMerge result="effect1_texture_624_10950"><feMergeNode in="displacedImage"/></feMerge>
              </filter>
              <filter id="filter4_g_624_10950" x="1373.54" y="1219.92" width="519.973" height="404.42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feTurbulence type="fractalNoise" baseFrequency="0.021376656368374825 0.021376656368374825" numOctaves={3} seed={1325}/>
                <feDisplacementMap in="shape" scale={8} xChannelSelector="R" yChannelSelector="G" result="displacedImage" width="100%" height="100%"/>
                <feMerge result="effect1_texture_624_10950"><feMergeNode in="displacedImage"/></feMerge>
              </filter>
              <filter id="mascotte-left-spin-blur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur ref={leftBlurRef} stdDeviation="0"/>
              </filter>
              <filter id="mascotte-right-spin-blur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur ref={rightBlurRef} stdDeviation="0"/>
              </filter>
            </defs>
            <g filter="url(#filter0_g_624_10950)">
              <path d="M157.293 1126.57C-69.5661 1711.09 189.7 1755.87 193.752 1844.69H2221.3C2256.2 1631.76 2395.5 1696.47 2265.87 1172.49C2201.32 911.604 2501.64 -260.915 1924.8 58.7937C1758.55 150.932 1594.21 542.592 1472.63 677.295C1407.56 677.295 1086.08 656.463 976.783 593.469C941.6 614.336 964.304 677.295 840.328 677.295C617.427 677.295 276.862 -302.466 25.2397 177.785C-40.5668 303.385 58.6762 808.309 157.293 1126.57Z" fill="#000000"/>
            </g>
            <g ref={leftEyeGroupRef}>
              <g filter="url(#filter1_g_624_10950)">
                <path d="M781.674 1659.76C1013.51 1627.91 1098.11 1493.87 1111.44 1430.83C1135.42 1359.17 1101.45 1278.21 1081.46 1246.7C813.651 876.433 550.173 1027.72 441.917 1157.12C333.995 1256.65 346.985 1432.49 376.964 1500.5C415.27 1566.86 549.84 1691.61 781.674 1659.76Z" fill="white"/>
              </g>
              <g clipPath="url(#mascotte-left-eye-clip)">
                <g ref={leftPupilScaleRef} filter="url(#mascotte-left-spin-blur)">
                  <g ref={leftPupilRef}>
                    <g filter="url(#filter3_g_624_10950)">
                      <path ref={leftPupilPathRef} d="M773.084 1320.7L744.926 1264.79C735.441 1245.96 715.725 1234.88 694.808 1236.62C672.732 1238.46 653.94 1254.18 647.855 1275.89L632.198 1331.77C626.143 1353.38 614.936 1373.21 599.581 1389.5L585.468 1404.48C575.824 1414.71 564.478 1423.13 551.971 1429.33L482.253 1463.92C463.065 1473.43 454.849 1496.83 463.904 1516.17C468.665 1526.34 477.576 1533.82 488.321 1536.68L607.015 1568.25C626.281 1573.38 644.384 1582.11 660.405 1594L695.982 1620.4C711.116 1631.64 730.429 1635.52 748.873 1631.05C764.008 1627.37 777.438 1618.33 786.73 1605.57L798.158 1589.86C809.244 1574.63 823.701 1562.24 840.328 1553.73L950.581 1497.27C966.885 1488.92 975.421 1470.23 971.063 1452.41C967.768 1438.95 957.633 1428.4 944.465 1424.74L877.102 1406.01C852.874 1399.28 830.65 1386.79 812.242 1369.58L803.594 1361.49C791.135 1349.84 780.81 1336.04 773.084 1320.7Z" fill="#000000"/>
                    </g>
                  </g>
                </g>
              </g>
            </g>
            <g ref={rightEyeGroupRef}>
              <g filter="url(#filter2_g_624_10950)">
                <path d="M1585.04 1659.76C1353.2 1627.91 1268.6 1493.87 1255.28 1430.83C1231.29 1359.17 1265.27 1278.21 1285.25 1246.7C1553.06 876.433 1816.54 1027.72 1924.8 1157.12C2032.72 1256.65 2019.73 1432.49 1989.75 1500.5C1951.44 1566.86 1816.87 1691.61 1585.04 1659.76Z" fill="white"/>
              </g>
              <g clipPath="url(#mascotte-right-eye-clip)">
                <g ref={rightPupilScaleRef} filter="url(#mascotte-right-spin-blur)">
                  <g ref={rightPupilRef}>
                    <g filter="url(#filter4_g_624_10950)">
                      <path ref={rightPupilPathRef} d="M1576.65 1308.17L1604.81 1252.27C1614.29 1233.44 1634.01 1222.35 1654.93 1224.1C1677 1225.94 1695.79 1241.65 1701.88 1263.37L1717.53 1319.24C1723.59 1340.85 1734.8 1360.69 1750.15 1376.98L1764.26 1391.95C1773.91 1402.18 1785.25 1410.6 1797.76 1416.81L1867.48 1451.39C1886.67 1460.91 1894.88 1484.31 1885.83 1503.64C1881.07 1513.81 1872.16 1521.3 1861.41 1524.15L1742.72 1555.73C1723.45 1560.85 1705.35 1569.58 1689.33 1581.47L1653.75 1607.88C1638.62 1619.11 1619.3 1623 1600.86 1618.52C1585.73 1614.85 1572.3 1605.81 1563 1593.04L1551.57 1577.34C1540.49 1562.11 1526.03 1549.72 1509.4 1541.2L1399.15 1484.74C1382.85 1476.4 1374.31 1457.7 1378.67 1439.89C1381.96 1426.42 1392.1 1415.88 1405.27 1412.22L1472.63 1393.49C1496.86 1386.75 1519.08 1374.27 1537.49 1357.05L1546.14 1348.97C1558.6 1337.32 1568.92 1323.51 1576.65 1308.17Z" fill="#000000"/>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }
);

export default Mascotte;
