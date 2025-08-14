import os
os.environ["IMAGEMAGICK_BINARY"] = r"C:\\Program Files\\ImageMagick-7.1.2-Q16\\magick.exe"  # 如有 HDRI，请改为 Q16-HDRI

from moviepy.editor import ColorClip, TextClip, CompositeVideoClip, VideoClip, vfx
import numpy as np

# 视频参数
W, H = 720, 1280  # 竖屏分辨率
DURATION = 8      # 秒
FONT = "Arial"  # 可改为 Arial 或本机已安装的中文字体
FONT_SIZE = 70

# 渐变背景
def make_gradient(get_frame, t):
    # 动态渐变色
    color1 = np.array([30, 90, 180])
    color2 = np.array([240, 180, 60])
    alpha = 0.5 + 0.5 * np.sin(2 * np.pi * t / DURATION)
    color = (1 - alpha) * color1 + alpha * color2
    frame = np.tile(color, (H, W, 1)).astype(np.uint8)
    return frame

bg_clip = VideoClip(lambda t: make_gradient(None, t), duration=DURATION)

# 动态文字动画
def moving_text(txt, start, end, t0, t1, color='white'):
    txt_clip = TextClip(txt, fontsize=FONT_SIZE, font=FONT, color=color, method='caption', size=(W, None))
    txt_clip = txt_clip.set_start(t0).set_end(t1)
    def pos_func(t):
        prog = (t-t0)/(t1-t0)
        x = start[0] + (end[0]-start[0])*prog
        y = start[1] + (end[1]-start[1])*prog
        return (x, y)
    return txt_clip.set_position(pos_func).crossfadein(0.5).crossfadeout(0.5)

# 太阳动画
def sun_pos(t):
    # 太阳从左到右移动
    x = 100 + (W-200) * (t/DURATION)
    y = 200 + 100 * np.sin(np.pi * t / DURATION)
    return x, y


def make_sun(t):
    frame = np.zeros((H, W, 3), dtype=np.uint8)
    x, y = sun_pos(t)
    rr, cc = np.ogrid[:H, :W]
    mask = (rr - int(y))**2 + (cc - int(x))**2 <= 60**2
    frame[mask] = [255, 220, 80]
    return frame

sun_clip = VideoClip(make_sun, duration=DURATION).set_opacity(0.7)

# 多段文字
clips = [bg_clip, sun_clip]
clips.append(moving_text("黑龙江旅游", (W//2-200, H//2-200), (W//2-200, H//2-200), 0, 2.5, color='#fff'))
clips.append(moving_text("欢迎来到哈尔滨！", (W//2-220, H//2-80), (W//2-220, H//2-80), 1.2, 4, color='#ffe066'))
clips.append(moving_text("夜幕降临，城市灯光亮起", (W//2-250, H//2+80), (W//2-250, H//2+80), 4, 6, color='#aee'))
clips.append(moving_text("新的一天，出发去齐齐哈尔！", (W//2-260, H//2+180), (W//2-260, H//2+180), 6, 8, color='#ffb347'))

# 小球动画（代表人物）
def person_pos(t):
    # 人物在底部左右移动
    x = 100 + (W-200) * (t/DURATION)
    y = H - 120
    return x, y


def make_person(t):
    frame = np.zeros((H, W, 3), dtype=np.uint8)
    x, y = person_pos(t)
    rr, cc = np.ogrid[:H, :W]
    mask = (rr - int(y))**2 + (cc - int(x))**2 <= 40**2
    frame[mask] = [70, 180, 255]
    return frame

person_clip = VideoClip(make_person, duration=DURATION).set_opacity(0.9)
clips.append(person_clip)

final = CompositeVideoClip(clips, size=(W, H)).fadein(0.8).fadeout(0.8)
os.makedirs("assets/video", exist_ok=True)
final.write_videofile("assets/video/intro.mp4", fps=24, codec="libx264", audio=False)
