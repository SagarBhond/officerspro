package com.cms.officerspro.entity.generator;

import com.cms.officerspro.entity.*;
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
        if (object instanceof Victim) {
            prefix = "victim";
        } else if (object instanceof Officer) {
            prefix = "officer";
        }else if (object instanceof Witness) {
            prefix = "witness";
        } else if (object instanceof Offender) {
            prefix = "offender";
        }else if(object instanceof CrimeDetails){
            prefix ="crime";
        }else if(object instanceof InvestigationDetails) {
            prefix = "investigation";
        }else if(object instanceof FileEntity) {
            prefix = "file";
        }else if (object instanceof Ferrist) {
            prefix = "ferrist";
        }else if(object instanceof Evidence) {
            prefix = "evidence";
        }else {
            throw new IllegalArgumentException("Unrecognized entity for ID generation");
        }

        String timeStamp = new SimpleDateFormat("yyyyMMddHHmmssSSS").format(new Date());

        String uniqueID = UUID.randomUUID().toString().split("-")[0];

        return String.format("%s_%s_%s", prefix, timeStamp, uniqueID);
    }
}
