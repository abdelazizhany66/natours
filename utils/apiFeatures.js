class APIFeatures {
    constructor (query,queryString){
      this.query = query
      this.queryString = queryString
    }
  
    filter(){
      const queryObj = { ...this.queryString };
      const excludedFields = ['sort','limit','fields','page'];
      excludedFields.forEach(el=> delete queryObj[el]);
  
      //B2) Advanced Filtering
      let queryStr = JSON.stringify(queryObj)
      queryStr =  queryStr.replace(/\b(gt|gte|lt|lte)\b/g , match => `$${match}`)
    
      this.query =  this.query.find(JSON.parse(queryStr));
      
      return this;
    }
  
    sort(){
      if(this.queryString.sort){
        const sortBy = this.queryString.sort.split(',').join(' ')
        this.query = this.query.sort(sortBy)
      }else{
        this.query = this.query.sort('-createdAt')
      }
      return this;
    }
  
    limitFields(){
      if(this.queryString.fields){
        const fields = this.queryString.fields.split(',').join(' ')
        this.query = this.query.select(fields)
      }else{
        this.query = this.query.select('-__v')
      }
      return this;
    }
  
    paginate(){
      const page = this.queryString.page * 1 || 1
      const limit = this.queryString.limit * 1 || 100
      const skip = (page - 1) * limit
  
      this.query = this.query.skip(skip).limit(limit) 
      
      return this;
    }
  }
  module.exports = APIFeatures

      //BUILD QUERY
    //B1)Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['sort','limit','fields','page'];
    // excludedFields.forEach(el=> delete queryObj[el]);

    // //B2) Advanced Filtering
    // let queryStr = JSON.stringify(queryObj)
    // queryStr =  queryStr.replace(/\b(gt|gte|lt|lte)\b/g , match => `$${match}`)
  
    // let query =  Tour.find(JSON.parse(queryStr));
    
    //2)SORTING
    // if(req.query.sort){
    //   const sortBy = req.query.sort.split(',').join(' ')
    //   query = query.sort(sortBy)
    // }else{
    //   query = query.sort('-createdAt')
    // }

    //3)FILEDS
    // if(req.query.fields){
    //   const fields = req.query.fields.split(',').join(' ')
    //   query = query.select(fields)
    // }else{
    //   query = query.select('-__v')
    // }
    //4) pagination
    // const page = req.query.page * 1 || 1
    // const limit = req.query.limit * 1 || 100
    // const skip = (page - 1) * limit

    // query = query.skip(skip).limit(limit)
    
    // if(req.query.page){
    //   const numTours = await Tour.countDocuments()
    //   if(skip >= numTours) throw new Error ('this page does not exist')
    // }
    // const query = Tour.find()
    // .where('price')
    // .equals('5')