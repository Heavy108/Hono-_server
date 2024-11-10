
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { logger } from "hono/logger"
import dbConnect from './db/connect'
import FavYoutbeVideosModel from './db/fav-model'
import { isValidObjectId } from 'mongoose'
import { stream, streamText, streamSSE } from 'hono/streaming'

const app = new Hono()

//middleware
app.use(poweredBy())
app.use(logger())

dbConnect()
  .then(() => {
    //GET List

    app.get('/', async (c) => {
      const documents = await FavYoutbeVideosModel.find()
      return c.json(
        documents.map((d) => d.toObject()), 200
      )
    })
    //Create document
    app.post('/', async (c) => { 
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) {
        delete formData.thumbnailUrl
      }
      const favYoutubeVideosObj = new FavYoutbeVideosModel(formData)
      try {
        const document = await favYoutubeVideosObj.save()
        return c.json(document.toObject(), 201)
      } catch (error) {
        return c.json((error as any)?.message || "Internal pointer variable error",
          500
        )
      }
    })

    //view document by ID
    app.get('/:documentId', async(c) =>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)){
        return c.json("Invalid ID" ,400)
      }
      const document = await FavYoutbeVideosModel.findById(id)
      if(!document) return c.json("Document not found" ,404)

        return c.json(document.toObject() ,200)
    })


    app.get('/d/:documentId', async(c) =>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)){
        return c.json("Invalid ID" ,400)
      }
      const document = await FavYoutbeVideosModel.findById(id)
      if(!document) return c.json("Document not found" ,404)

      return streamText(c, async(stream) =>{
        stream.onAbort(() =>{
          console.log('Aborted')
        })
        for (let i =0 ; i< document.description.length; i++){
          await stream.write(document.description)
          //wait 1 second
          await stream.sleep(1000)

        }
      })
    })

    app.patch("/:documentID" ,async(c) =>{
      const id = c.req.param("documentId")
      if (!isValidObjectId(id)){
        return c.json("Invalid ID" ,400)
      }
      const document = FavYoutbeVideosModel.findById(id)
      if(!document) return c.json("Document not found" ,404)

        const formData =await c.req.json()

        if(!formData.thumbnailUrl) delete formData.thumbnailUrl

        try {
          const updatedDocument = await FavYoutbeVideosModel.findByIdAndUpdate(
            id,
            formData,
            {
              new: true
            }
          )
          return c.json(updatedDocument?.toObject())
        }catch(error){
          return c.json((error as any)?.message || "Internal pointer variable error",
          500
        )
        }
    })

   app.delete('/:documennt' ,async(c) =>{
    const id = c.req.param("documentId")
    if (!isValidObjectId(id)){
      return c.json("Invalid ID" ,400)
    }
   try {
    const deletedDocument = await FavYoutbeVideosModel.findByIdAndDelete(id);
    return c.json(deletedDocument?.toObject() , 200)
   } catch (error) {
    return c.json((error as any)?.message || "Internal pointer variable error",
          500
        )
   }

   })
      
  })
  .catch((err) => {
    app.get('/*', (c) => {
      return c.text(`Failed to connect mongodb: ${err.message}`)
    })
  })
app.onError((err, c) => {
  return c.text(`App Error: ${err.message}`)
})
// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

export default app
