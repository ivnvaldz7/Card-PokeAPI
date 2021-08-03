document.addEventListener('DOMContentLoaded', ()=>{
    const random = getRandomInt(1,151)
    fetchData(random)
})

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const fetchData = async (id)=>{
      try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          const data = await res.json()
          drawCard(data)
      } catch (error) {
          console.log(error)
      }
  }

const drawCard = (pokemon)=>{
    const flex = document.querySelector('.flex')
    const template = document.querySelector('#template-card').content
    const clone = template.cloneNode(true)
    const fragment = document.createDocumentFragment() 
    
    clone.querySelector('.card-body__img').setAttribute('src', pokemon.sprites.other.dream_world.   front_default)
    fragment.appendChild(clone)
    flex.appendChild(fragment)
}