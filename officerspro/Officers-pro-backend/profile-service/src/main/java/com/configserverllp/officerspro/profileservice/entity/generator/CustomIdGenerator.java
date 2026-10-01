package com.configserverllp.officerspro.profileservice.entity.generator;

import com.configserverllp.officerspro.profileservice.entity.Officer;
import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

public class CustomIdGenerator implements IdentifierGenerator {
    
    @Override
    public Serializable generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        String prefix;
        
        if (object instanceof Officer) {
            prefix = "officer";
        } else {
            throw new IllegalArgumentException("Unrecognized entity for ID generation: " + object.getClass().getName());
        }

        String timeStamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());
        String uniqueID = UUID.randomUUID().toString().split("-")[0];

        return String.format("%s_%s_%s", prefix, timeStamp, uniqueID);
    }
}
