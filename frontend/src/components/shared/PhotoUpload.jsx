import { useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Camera, Crop, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

/** Génère un blob recadré à partir de l'image et de la sélection. */
async function genererBlobRecadre(image, recadrage) {
  const canvas = document.createElement('canvas')
  const echelleX = image.naturalWidth / image.width
  const echelleY = image.naturalHeight / image.height
  const largeur = Math.max(1, Math.round(recadrage.width * echelleX))
  const hauteur = Math.max(1, Math.round(recadrage.height * echelleY))
  canvas.width = largeur
  canvas.height = hauteur
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    recadrage.x * echelleX,
    recadrage.y * echelleY,
    largeur,
    hauteur,
    0,
    0,
    largeur,
    hauteur
  )
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
  })
}

/**
 * Upload de photo avec aperçu et recadrage.
 * `onChange` reçoit un File (ou null).
 */
export function PhotoUpload({ valeur, onChange, nom = 'photo' }) {
  const [apercu, setApercu] = useState(valeur || null)
  const [sourceCrop, setSourceCrop] = useState(null)
  const [recadrage, setRecadrage] = useState()
  const [ouvert, setOuvert] = useState(false)
  const imageRef = useRef(null)
  const inputRef = useRef(null)

  function selectionner(e) {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    if (!fichier.type.startsWith('image/')) return
    const url = URL.createObjectURL(fichier)
    setSourceCrop(url)
    setRecadrage(undefined)
    setOuvert(true)
    e.target.value = ''
  }

  async function validerRecadrage() {
    if (!imageRef.current || !recadrage || !recadrage.width) {
      setApercu(sourceCrop)
      const reponse = await fetch(sourceCrop)
      const blob = await reponse.blob()
      onChange(new File([blob], `${nom}.jpg`, { type: 'image/jpeg' }))
      setOuvert(false)
      return
    }
    const blob = await genererBlobRecadre(imageRef.current, recadrage)
    const fichier = new File([blob], `${nom}.jpg`, { type: 'image/jpeg' })
    setApercu(URL.createObjectURL(blob))
    onChange(fichier)
    setOuvert(false)
  }

  function supprimer() {
    setApercu(null)
    onChange(null)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted">
          {apercu ? (
            <img src={apercu} alt="Aperçu de la photo" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        {apercu && (
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute -right-1 -top-1 rounded-full"
            onClick={supprimer}
            aria-label="Supprimer la photo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" /> Choisir une photo
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">JPG ou PNG, 2 Mo maximum. Recadrage au format carré.</p>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={selectionner} />

      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-4 w-4" /> Recadrer la photo
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {sourceCrop && (
              <ReactCrop
                crop={recadrage}
                onChange={(_, pourcentage) => setRecadrage(pourcentage)}
                aspect={1}
                circularCrop
                keepSelection
              >
                <img
                  ref={imageRef}
                  src={sourceCrop}
                  alt="Photo à recadrer"
                  style={{ maxHeight: 360 }}
                  onLoad={() => setRecadrage({ unit: '%', width: 80, height: 80, x: 10, y: 10 })}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <Button onClick={validerRecadrage}>Valider le recadrage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
