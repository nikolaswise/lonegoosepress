import rq from 'modular-request'

rq.get('http://api.nikolas.ws/lone-goose-press/catalog')
  .then(catalog => {
    console.log(catalog)
  })