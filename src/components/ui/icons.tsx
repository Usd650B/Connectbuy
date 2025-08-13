import * as React from "react"
import { Loader2, AlertCircle, X, Upload, Image as ImageIcon, Trash2, Camera } from "lucide-react"

export const Icons = {
  spinner: Loader2,
  alertCircle: AlertCircle,
  x: X,
  upload: Upload,
  image: ImageIcon,
  trash2: Trash2,
  camera: Camera,
}

export type IconName = keyof typeof Icons
