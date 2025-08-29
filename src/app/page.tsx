import BlurText from "./components/BlurText";
import GlareHover from "./components/glare-hover";
import CurvedLoop from "./components/curvedloop";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-16 min-h-screen">
      {/* Bagian atas: BlurText + GlareHover sebelahan */}
      <div className="flex flex-row items-center justify-center gap-12">
        <BlurText
          text="Hi, I'm Bayu Gw dari SMKN 8 Malang "
          delay={150}
          animateBy="words"
          direction="top"
          className="text-5xl custom-text"
        />

        <div style={{ height: "600px", position: "relative" }}>
          <GlareHover
            width="300px"
            height="400px"
            glareColor="#580a97a1"
            glareOpacity={0.3}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
            playOnce={false}
          >
            <img
              src={"/pixel.jpeg"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </GlareHover>
        </div>
      </div>

      {/* Bagian bawah: CurvedLoop */}
      <div className="w-full">
        <CurvedLoop
          marqueeText="✦ Canva ✦ Photoshop ✦ Bayu ✦ Next.Js ✦ Lightroom ✦"
          speed={3}
          curveAmount={500}
          direction="right"
          interactive={true}
          className="custom-text"
        />
      </div>
    </main>
  );
}
