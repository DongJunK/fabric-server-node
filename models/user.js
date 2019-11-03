const user = (sequelize, DataTypes)=>{
    return sequelize.define('user',{
        email:{
            type: DataTypes.STRING(40),
            allowNull: false,
            primaryKey: true
        }, 
        password:{
            type: DataTypes.STRING(300),
            allowNull: false
        },
        name:{
            type: DataTypes.STRING(60),
            allowNull: false
        },
        phone_num:{
            type: DataTypes.STRING(20),
            allowNull: false
        }
    },{
        underscored: true,
        timestamps: false,
        freezeTableName: true
    });
};

module.exports = user;